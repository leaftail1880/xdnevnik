import notifee, {
	AndroidImportance,
	AndroidVisibility,
	AuthorizationStatus,
} from '@notifee/react-native'
import * as Device from 'expo-device'
import {
	ObservableSet,
	autorun,
	makeAutoObservable,
	runInAction,
	toJS,
} from 'mobx'
import { Toast } from '../Components/Modal'
import { getSubjectName } from '../Components/SubjectName'
import { Lesson, LessonState } from '../NetSchool/classes'
import { DiaryStore, HomeworkMarksStore } from '../Stores/NetSchool'
import { Settings } from '../Stores/Settings'
import { clearBackgroundInterval, setBackgroundInterval } from './timers'

const Notification = new (class {
	constructor() {
		makeAutoObservable(this)
	}

	lessonChannelId = ''
	marksChannelId = ''
	id: undefined | string = undefined
	currentLesson: undefined | string = undefined;

	*remove(id = Notification.id) {
		if (!id) return
		yield notifee.cancelNotification(id)
		if (Notification.id) Notification.id = undefined
	}
})()

notifee.onBackgroundEvent(async () => {
	// TODO React on event, e.g. open approprietary screen etc
})

autorun(() => {
	const enabled = Settings.lessonNotifications
	notificationSetup(enabled)
})

async function notificationSetup(enabled: boolean) {
	// Show notification channels even when they are disabled
	const lessonChannelId = await notifee.createChannel({
		id: 'lessons',
		name: 'Уроки',
		importance: AndroidImportance.HIGH,
		visibility: AndroidVisibility.PUBLIC,
		description: 'Уведомления о текущих уроках',
	})

	const marksChannelId = await notifee.createChannel({
		id: 'marks',
		name: 'Новые оценки',
		importance: AndroidImportance.DEFAULT,
		visibility: AndroidVisibility.PUBLIC,
		description: 'Уведомления о новых оценках',
	})

	const oldNotification = (await notifee.getDisplayedNotifications()).find(
		e => e.notification.android?.channelId === lessonChannelId
	)

	if (!enabled)
		return Notification.remove(Notification.id || oldNotification?.id)

	if (Device.isDevice) {
		// Required for iOS
		// See https://notifee.app/react-native/docs/ios/permissions
		const { authorizationStatus } = await notifee.requestPermission()

		if (authorizationStatus === AuthorizationStatus.DENIED) {
			Settings.save({ lessonNotifications: false })
			return
		}
	} else {
		Toast.show({ title: 'Уведомления недоступны вне устройства', error: true })
		Settings.save({ lessonNotifications: false })
		return
	}

	runInAction(() => {
		Notification.lessonChannelId = lessonChannelId
		Notification.marksChannelId = marksChannelId
		if (oldNotification?.id) Notification.id = oldNotification.id
	})
}

let fetchMarksInterval: ReturnType<typeof setBackgroundInterval>

autorun(function fetchMarks() {
	if (fetchMarksInterval) clearBackgroundInterval(fetchMarksInterval)
	if (!Settings.marksNotifications || !Notification.marksChannelId) {
		return
	}

	fetchMarksInterval = setBackgroundInterval(async () => {
		runInAction(() => {
			HomeworkMarksStore.withParams({
				studentId: Settings.studentId,
				withExpiredClassAssign: true,
				withoutMarks: false,
			})
			HomeworkMarksStore.reload()
		})
	}, 60000)
	//
})

const marksValueStore = new (class {
	notified = new ObservableSet<string>()
	constructor() {
		makeAutoObservable(this)
	}
})()

autorun(function newMarksCheck() {
	if (!Settings.marksNotifications || !Notification.marksChannelId) {
		return
	}

	if (!HomeworkMarksStore.result) return

	for (const assignment of HomeworkMarksStore.result.filter(
		e => typeof e.result === 'number'
	)) {
		if (!marksValueStore.notified.has(assignment.assignmentId + '')) {
			runInAction(() => {
				marksValueStore.notified.add(assignment.assignmentId + '')
			})
			notifee.displayNotification({
				title: `${assignment.result} - ${getSubjectName(assignment)}, ${
					assignment.assignmentTypeAbbr
				}, Веc: ${assignment.weight}`,
				body: `${assignment.assignmentName}`,
				android: {
					channelId: Notification.marksChannelId,
					smallIcon: 'notification_icon',
				},
			})
		}
	}
})

let currentLessonInterval: ReturnType<typeof setBackgroundInterval>

autorun(function notificationFromDiary() {
	if (currentLessonInterval) clearBackgroundInterval(currentLessonInterval)
	if (!Settings.lessonNotifications || !Notification.lessonChannelId) {
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
						Lesson.prototype.minutes.call(lesson, now) as ReturnType<
							Lesson['minutes']
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
						...(Notification.id ? { id: Notification.id } : {}),
						title,
						body,
						android: {
							channelId: Notification.lessonChannelId,
							ongoing: true,
							smallIcon: 'notification_icon',

							// only alert when lesson notification
							onlyAlertOnce: Notification.currentLesson === uuid,

							progress:
								state === LessonState.going
									? {
											current: progress,
											max: 100,
									  }
									: void 0,
						},
						ios: {},
					})

					runInAction(() => {
						Notification.id = id
						Notification.currentLesson = uuid
					})

					return
				}

				// Nothing to show
				Notification.remove()
			}),
		3000
	)
})
