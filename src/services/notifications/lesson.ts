import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from '@notifee/react-native'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { getSubjectName } from '~components/SubjectName'
import { Logger } from '~constants'
import { Settings } from '~models/settings'
import {
	clearBackgroundInterval,
	setBackgroundInterval,
} from '../../utils/backgroundIntervals'
import { Lesson, LessonState } from '../net-school/entities'
import { DiaryStore } from '../net-school/store'

export const NotificationStore = new (class {
	constructor() {
		makeAutoObservable(this)
	}

	lessonChannelId = ''

	/**
	 * Current notification id
	 */
	id: undefined | string = undefined

	currentLesson: undefined | string = undefined

	async remove(id = NotificationStore.id) {
		if (!id) return

		await notifee.cancelDisplayedNotification(id)
		runInAction(() => {
			if (NotificationStore.id) NotificationStore.id = undefined
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
			NotificationStore.remove(NotificationStore.id || oldNotification?.id)
		})
	}

	runInAction(() => {
		NotificationStore.lessonChannelId = lessonChannelId
		if (oldNotification?.id) NotificationStore.id = oldNotification.id
	})
}

let currentLessonInterval: ReturnType<typeof setBackgroundInterval>
autorun(function notificationFromDiary() {
	if (currentLessonInterval) clearBackgroundInterval(currentLessonInterval)
	if (!Settings.notificationsEnabled || !NotificationStore.lessonChannelId) {
		return NotificationStore.remove()
	}

	const { result } = DiaryStore
	if (!result) return
	const diary = toJS(result)

	currentLessonInterval = setBackgroundInterval(
		() =>
			runInAction(async () => {
				// const date = new Date()
				// date.setHours(8, 41)
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
				NotificationStore.remove()
			}),
		3000,
	)
})

const minute = 60 * 1000

function getLessonPeriod(previous: Lesson, current: Lesson) {
	let period: Date | undefined
	let date: Date
	// TODO Support custom beforeLessonNotifTime
	const beforeLessonNotifTime = 15
	const minutesBetween = 15

	// If previous lesson is in the same day, send notification in the end of the lesson
	if (
		previous &&
		current.day.toYYYYMMDD() === previous.day.toYYYYMMDD() &&
		// Only when delay between lessons is less then 15
		(current.start.getTime() - previous.end.getTime()) / minute < minutesBetween
	) {
		date = new Date(previous.end.getTime())
		date.setMinutes(date.getMinutes() + 1)
		period = new Date(current.start.getTime() - previous.end.getTime())
	} else {
		// Send before lesson
		date = new Date(current.start.getTime())
		date.setMinutes(date.getMinutes() - beforeLessonNotifTime)
	}
	return { date, period }
}

async function showNotification(
	lesson: Lesson,
	now: number,
	period: Date | undefined,
) {
	const lessonId = lesson.classmeetingId + '' + lesson.subjectId
	const lessonName = getSubjectName({
		subjectId: lesson.subjectId,
		subjectName: lesson.subjectName,
	})

	const { state, beforeEnd, beforeStart, progress, total } =
		Lesson.prototype.status.call(lesson, now) as ReturnType<Lesson['status']>

	// TODO Custom format support
	let title = ''
	title += lessonName
	title += ' | '
	title += lesson.roomName ?? 'Нет кабинета'

	let body = ''

	body += `${lesson.start.toHHMM()} - ${lesson.end.toHHMM()}. `
	if (state === LessonState.notStarted) {
		body += `До начала ${beforeStart} мин `
		if (period) body += `Перемена ${period.getMinutes()} мин.`
	} else if (state === LessonState.going) {
		body += `Прошло ${beforeEnd}/${total} мин, осталось ${total - beforeEnd}`
	}

	const notificationId = await notifee.displayNotification({
		...(NotificationStore.id ? { id: NotificationStore.id } : {}),
		title,
		body,
		android: {
			channelId: NotificationStore.lessonChannelId,
			ongoing: true,
			smallIcon: 'notification_icon',

			// only alert when lesson notification
			onlyAlertOnce: NotificationStore.currentLesson === lessonId,

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

	Logger.debug('Sent notificaion with id', notificationId)

	runInAction(() => {
		NotificationStore.id = notificationId
		NotificationStore.currentLesson = lessonId
	})
}

