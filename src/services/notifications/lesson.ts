import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from '@notifee/react-native'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { getSubjectName } from '~components/SubjectName'
import { Settings } from '~models/settings'
import { Lesson, LessonState } from '~services/net-school/entities'
import { DiaryStore } from '~services/net-school/store'
import {
	clearBackgroundInterval,
	setBackgroundInterval,
} from '~utils/backgroundIntervals'
import { MarksNotificationStore } from './marks'

export const LessonNotifStore = new (class {
	constructor() {
		makeAutoObservable(this)
	}

	lessonChannelId = ''

	/**
	 * Current notification id
	 */
	id: undefined | string = undefined

	currentLesson: undefined | string = undefined

	async remove(id = LessonNotifStore.id) {
		if (!id) return

		await notifee.cancelDisplayedNotification(id)
		runInAction(() => {
			if (LessonNotifStore.id) LessonNotifStore.id = undefined
		})
	}
})()

export async function setupLessonChannel(enabled: boolean) {
	// Show notification channels even when they are disabled
	const lessonChannelId = await notifee.createChannel({
		id: 'lessons',
		name: 'Уроки',
		importance: AndroidImportance.HIGH,
		visibility: AndroidVisibility.PUBLIC,
		description: 'Уведомления о текущих уроках',
	})

	const oldNotification = (await notifee.getDisplayedNotifications()).find(
		e => e.notification.android?.channelId === lessonChannelId,
	)

	if (!enabled) {
		return runInAction(() => {
			LessonNotifStore.remove(LessonNotifStore.id || oldNotification?.id)
		})
	}

	runInAction(() => {
		LessonNotifStore.lessonChannelId = lessonChannelId
		if (oldNotification?.id) LessonNotifStore.id = oldNotification.id
	})
}

let currentLessonInterval: ReturnType<typeof setBackgroundInterval>
autorun(function notificationFromDiary() {
	if (currentLessonInterval) clearBackgroundInterval(currentLessonInterval)
	if (!Settings.notificationsEnabled || !LessonNotifStore.lessonChannelId) {
		return LessonNotifStore.remove()
	}

	const { result } = DiaryStore
	if (!result) return
	const diary = toJS(result)

	currentLessonInterval = setBackgroundInterval(
		() =>
			runInAction(async () => {
				// const date = new Date()
				// date.setHours(7, 32)
				// const now = date.getTime()
				const now = Date.now()

				for (const [i, lesson] of diary.lessons.entries()) {
					if (!lesson.end || !lesson.start) continue // Broken data i guess
					if (lesson.end.getTime() < now) continue // Already was

					// period - перемена
					const previous = diary.lessons[i - 1]
					const { date, period } = getLessonPeriod(previous, lesson)
					if (date.getTime() > now) continue

					return await showNotification(lesson, now, period)
				}

				// Nothing to show
				LessonNotifStore.remove()
			}),
		1000,
	)
})

const minute = 60 * 1000

function getLessonPeriod(previous: Lesson, current: Lesson) {
	let period: Date | undefined
	let date: Date
	// TODO Support custom
	const beforeLessonNotifTime = 15

	// If previous lesson is in the same day, send notification in the end of the lesson
	if (
		previous &&
		current.day.toYYYYMMDD() === previous.day.toYYYYMMDD() &&
		// Only when delay between lessons is less then 15
		(current.start.getTime() - previous.end.getTime()) / minute <=
			beforeLessonNotifTime
	) {
		date = new Date(previous.end.getTime())
		// date.setMinutes(date.getMinutes() + 1)
		period = new Date(current.start.getTime() - previous.end.getTime())
	} else {
		// Send before lesson
		date = new Date(current.start.getTime())
		date.setMinutes(date.getMinutes() - beforeLessonNotifTime)
	}
	return { date, period }
}

let foregroundServiceRegistered = false

async function showNotification(
	lesson: Lesson,
	now: number,
	period: Date | undefined,
) {
	const lessonId = lesson.classmeetingId + '' + lesson.subjectId
	const lessonName = getSubjectName(lesson)

	const { state, startsAfter, progress, elapsed, remaining } = Lesson.status(
		lesson,
		now,
	)

	let title = ''
	title += lessonName
	title += ' | '
	title += lesson.roomName ?? 'Нет кабинета'

	let body = ''

	body += `${lesson.start.toHHMM()} - ${lesson.end.toHHMM()}. `
	if (state === LessonState.notStarted) {
		if (period) body += `Перемена ${period.getMinutes()} мин. `
		body += startsAfter
	} else if (state === LessonState.going) {
		body += `Прошло ${elapsed} мин, осталось ${remaining}`
	}

	try {
		if (!foregroundServiceRegistered) {
			notifee.registerForegroundService(() => new Promise(() => {}))
			foregroundServiceRegistered = true
		}
	} catch (e) {
		MarksNotificationStore.log(
			'error',
			'Не удалось зарегистрировать сервис ПОСТОЯННЫХ уведомлений. Могут быть перебои в работе.',
		)
	}

	const notificationId = await notifee.displayNotification({
		...(LessonNotifStore.id ? { id: LessonNotifStore.id } : {}),
		title,
		body,
		android: {
			channelId: LessonNotifStore.lessonChannelId,
			ongoing: true,
			smallIcon: 'notification_icon',

			// only alert when lesson notification
			onlyAlertOnce: LessonNotifStore.currentLesson === lessonId,
			asForegroundService: true,

			progress:
				state === LessonState.going
					? {
							current: progress,
							max: 100,
						}
					: void 0,
			pressAction: { id: 'default' },
		},
		ios: {},
	})

	runInAction(() => {
		LessonNotifStore.id = notificationId
		LessonNotifStore.currentLesson = lessonId
	})
}
