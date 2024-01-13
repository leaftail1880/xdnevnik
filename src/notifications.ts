import notifee, {
	AndroidImportance,
	AndroidVisibility,
	AuthorizationStatus,
} from '@notifee/react-native'
import * as Device from 'expo-device'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { Alert } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { getSubjectName } from './Components/SubjectName'
import { Lesson, LessonState } from './NetSchool/classes'
import { DiaryStore } from './Stores/API.stores'
import { Settings } from './Stores/Settings.store'

const Notification = new (class {
	constructor() {
		makeAutoObservable(this)
	}

	channelId = ''
	id: undefined | string = undefined
	currentLesson: undefined | string = undefined;

	*remove(id = Notification.id) {
		if (!id) return
		yield notifee.cancelNotification(id)
		if (Notification.id) Notification.id = undefined
	}
})()

autorun(() => {
	const enabled = Settings.notifications
	notificationSetup(enabled)
})

async function notificationSetup(enabled: boolean) {
	// Show notification channels even when they are disabled
	const channelId = await notifee.createChannel({
		id: 'lessons',
		name: 'Уроки',
		importance: AndroidImportance.HIGH,
		visibility: AndroidVisibility.PUBLIC,
		lightColor: Colors.$iconPrimary,
		description: 'Уведомления об текущих уроках',
	})

	const oldNotification = (await notifee.getDisplayedNotifications()).find(
		e => e.notification.android?.channelId === channelId
	)

	if (!enabled)
		return Notification.remove(Notification.id || oldNotification?.id)

	if (Device.isDevice) {
		// Required for iOS
		// See https://notifee.app/react-native/docs/ios/permissions
		let response = await notifee.requestPermission()

		if (response.authorizationStatus === AuthorizationStatus.DENIED) {
			Alert.alert('Разреши уведомления!')
			response = await notifee.requestPermission()
		}

		if (response.authorizationStatus === AuthorizationStatus.DENIED) {
			Alert.alert('Уведомления не были разрешены.')
			Settings.save({ notifications: false })
			return
		}
	} else {
		Alert.alert('Уведомления недоступны вне устройства')
		Settings.save({ notifications: false })
		return
	}

	runInAction(() => {
		Notification.channelId = channelId
		if (oldNotification?.id) Notification.id = oldNotification.id
	})
}
let interval: ReturnType<typeof setInterval>

autorun(function notificationFromDiary() {
	if (interval) clearInterval(interval)
	if (!Settings.notifications || !Notification.channelId) {
		return
	}

	const { result } = DiaryStore
	if (!result) return
	const diary = toJS(result)

	interval = setInterval(async () => {
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
				if (period) body += `Перемена ${period.getMinutes()} мин.`
				body += `До начала ${beforeStart} мин`
			} else if (state === LessonState.going) {
				body += `${beforeEnd}/${total} мин`
			}

			const id = await notifee.displayNotification({
				...(Notification.id ? { id: Notification.id } : {}),
				title,
				body,
				android: {
					channelId: Notification.channelId,
					ongoing: true,

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
	}, 3000)
})
