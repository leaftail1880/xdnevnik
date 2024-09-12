import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from '@notifee/react-native'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { getSubjectName } from '~components/SubjectName'
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

	currentLesson: undefined | string = undefined;

	*remove(id = NotificationStore.id) {
		if (!id) return
		yield notifee.cancelNotification(id)
		if (NotificationStore.id) NotificationStore.id = undefined
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

	if (!enabled)
		return NotificationStore.remove(NotificationStore.id || oldNotification?.id)

	runInAction(() => {
		NotificationStore.lessonChannelId = lessonChannelId
		if (oldNotification?.id) NotificationStore.id = oldNotification.id
	})
}

let currentLessonInterval: ReturnType<typeof setBackgroundInterval>
autorun(function notificationFromDiary() {
	if (currentLessonInterval) clearBackgroundInterval(currentLessonInterval)
	if (!Settings.notificationsEnabled || !NotificationStore.lessonChannelId) {
		return
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
					if (!lesson.end || !lesson.start) continue
					if (now > lesson.end.getTime()) continue

					let period: Date | undefined
					let date: Date
					const previous = diary.lessons[i - 1]

					// If previous lesson is in the same day, send notification in the end of it
					if (
						previous &&
						lesson.day.toYYYYMMDD() === previous.day.toYYYYMMDD() &&
						// Only when delay between lessons is less then 15
						(lesson.start.getTime() - previous.end.getTime()) / (60 * 1000) < 15
					) {
						date = new Date(previous.end.getTime())
						date.setMinutes(date.getMinutes() + 1)
						period = new Date(lesson.start.getTime() - previous.end.getTime())
					} else {
						// Send by 15 mins before lesson
						// TODO Support custom beforeLessonNotifTime
						date = new Date(lesson.start.getTime())
						date.setMinutes(date.getMinutes() - 15)
					}

					if (now < date.getTime()) continue

					const uuid = lesson.classmeetingId + '' + lesson.subjectId
					const lessonName = getSubjectName({
						subjectId: lesson.subjectId,
						subjectName: lesson.subjectName,
					})

					const { state, beforeEnd, beforeStart, progress, total } =
						Lesson.prototype.status.call(lesson, now) as ReturnType<
							Lesson['status']
						>

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
						body += `Прошло ${beforeEnd}/${total} мин`
					}

					const id = await notifee.displayNotification({
						...(NotificationStore.id ? { id: NotificationStore.id } : {}),
						title,
						body,
						android: {
							channelId: NotificationStore.lessonChannelId,
							ongoing: true,
							smallIcon: 'notification_icon',

							// only alert when lesson notification
							onlyAlertOnce: NotificationStore.currentLesson === uuid,

							progress:
								state === LessonState.going
									? {
											current: progress,
											max: 100,
										}
									: void 0,
							pressAction: {
								id: 'default',
							},
						},
						ios: {},
					})

					runInAction(() => {
						NotificationStore.id = id
						NotificationStore.currentLesson = uuid
					})

					return
				}

				// Nothing to show
				NotificationStore.remove()
			}),
		3000,
	)
})
