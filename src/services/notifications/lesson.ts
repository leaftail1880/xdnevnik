import { getSubjectName } from '@/components/SubjectName'
import { Settings } from '@/models/settings'
import { Lesson, LessonState } from '@/services/net-school/lesson'
import { DiaryStore } from '@/services/net-school/store'
import {
	clearBackgroundInterval,
	setBackgroundInterval,
} from '@/utils/backgroundIntervals'
import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from '@notifee/react-native'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { customSubjectToLessons } from '../net-school/entities'
import { MarksNotificationStore } from './marks'
import { Logger } from '@/constants'

let foregroundServiceRegistered = false

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

	day = new Date().getDate()

	async remove(id = LessonNotifStore.id) {
		if (!id) return

		if (foregroundServiceRegistered) {
			await notifee.stopForegroundService()
		} else await notifee.cancelDisplayedNotification(id)

		runInAction(() => {
			if (LessonNotifStore.id) LessonNotifStore.id = undefined
		})
	}
})()

function enabled() {
	return Settings.notificationsEnabled && Settings.lessonNotifications
}

export async function setupLessonChannel() {
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

	if (!enabled()) {
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
	if (!enabled() || !LessonNotifStore.lessonChannelId) {
		return LessonNotifStore.remove()
	}

	const { result } = DiaryStore
	if (!result) return
	const diary = toJS(result)

	const studentSettings = Settings.forStudentOrThrow()
	const date = new Date()
	const customSubjects = studentSettings.customSubjects
		.map((e, i) => customSubjectToLessons(e, date, i))
		.flat()

	const lessons = diary.lessons.concat(...customSubjects)
	LessonNotifStore.day

	currentLessonInterval = setBackgroundInterval(
		() =>
			runInAction(async () => {
				// const date = new Date()
				// date.setHours(7, 32)
				// const now = date.getTime()
				const now = Date.now()

				// just to trigget rerun of the code above and use custom subjects for new day
				LessonNotifStore.day = new Date().getDate()

				for (const [i, lesson] of lessons.entries()) {
					try {
						const end = Lesson.prototype.end
							.call(lesson, studentSettings)
							.getTime()
						if (!end) continue // Broken data i guess
						if (end < now) continue // Already was

						// period - перемена
						const previous = diary.lessons[i - 1]
						const { date, period } = getLessonPeriod(previous, lesson)
						if (date.getTime() > now) continue

						return await showNotification(lesson, now, period)
					} catch (e) {
						Logger.error(e)
					}
				}

				// Nothing to show
				LessonNotifStore.remove()
			}),
		1000,
	)
})

const minute = 60 * 1000

function getLessonPeriod(previousLesson: Lesson, currentLesson: Lesson) {
	let period: Date | undefined
	let date: Date
	const studentSettings = Settings.forStudentOrThrow()
	const beforeLessonNotifTime = currentLesson.notifyBeforeTime

	const current = currentLesson && {
		start: Lesson.prototype.start.call(currentLesson, studentSettings),
	}

	const previous = previousLesson && {
		start: Lesson.prototype.start.call(previousLesson, studentSettings),
		end: Lesson.prototype.end.call(previousLesson, studentSettings),
	}

	// If previous lesson is in the same day, send notification in the end of the lesson
	if (
		previous &&
		current.start.toYYYYMMDD() === previous.start.toYYYYMMDD() &&
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

async function showNotification(
	lesson: Lesson,
	now: number,
	period: Date | undefined,
) {
	const lessonId = lesson.classmeetingId + '' + lesson.subjectId
	const lessonName = getSubjectName(lesson)
	const studentSettings = Settings.forStudentOrThrow()

	const { state, startsAfter, progress, elapsed, remaining } = Lesson.status(
		lesson,
		studentSettings,
		now,
	)

	let title = ''
	title += lessonName
	title += ' | '
	title += lesson.roomName ?? 'Нет кабинета'

	let body = ''

	body += `${lesson.start(studentSettings).toHHMM()} - ${lesson.end(studentSettings).toHHMM()}. `
	if (state === LessonState.NotStarted) {
		if (period) body += `Перемена ${period.getMinutes()} мин. `
		body += startsAfter
	} else if (state === LessonState.Going) {
		body += `Прошло ${elapsed} мин, осталось ${remaining}`
	}

	try {
		if (!foregroundServiceRegistered) {
			notifee.registerForegroundService(() => new Promise(() => {}))
			foregroundServiceRegistered = true
		}
	} catch {
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
			asForegroundService: foregroundServiceRegistered,

			progress:
				state === LessonState.Going
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
