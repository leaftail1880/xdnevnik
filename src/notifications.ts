import notifee, {
	AndroidImportance,
	AuthorizationStatus,
} from '@notifee/react-native'
import * as Device from 'expo-device'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { Alert } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { getSubjectName } from './Components/SubjectName'
import { DiaryStore } from './Screens/Diary/stores'
import { Settings } from './Stores/Settings.store'

const NotificationsStore = makeAutoObservable({
	channelId: '',
	notifId: '',
	/** @type {object} */
	currentLesson: {},
})

autorun(async function notificationSetup() {
	// Show notification channels even when they are disabled
	const channelId = await notifee.createChannel({
		id: 'lessons',
		name: 'Уроки',
		importance: AndroidImportance.HIGH,
		lightColor: Colors.$iconPrimary,
	})

	if (!Settings.notifications) return
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

	const notificationId = await notifee.displayNotification({
		title: 'Урок',
		body: 'Обновление...',
		android: {
			channelId,
		},
	})

	runInAction(() => {
		NotificationsStore.channelId = channelId
		NotificationsStore.notifId = notificationId
	})

	return async () => {
		await notifee.cancelNotification(notificationId)
		runInAction(() => (NotificationsStore.notifId = ''))
	}
})

autorun(function notificationFromDiary() {
	if (
		!Settings.notifications ||
		!NotificationsStore.notifId ||
		!NotificationsStore.channelId
	) {
		return
	}

	const { result } = DiaryStore
	if (!result) return
	const diary = toJS(result)

	const interval = setInterval(async () => {
		for (const [i, lesson] of diary.lessons.entries()) {
			if (Date.now() > lesson.end.getTime()) continue

			let period: Date | undefined
			let date: Date
			const previous = diary.lessons[i - 1]

			if (previous && lesson.day.toYYYYMMDD() === previous.day.toYYYYMMDD()) {
				// If previous lesson in the same day, send notification in the end of it
				date = previous.end
				period = new Date(lesson.start.getTime() - previous.end.getTime())
			} else {
				date = lesson.start
				// Send by 15 mins before lesson
				date.setMinutes(date.getMinutes() - 15)
			}

			if (Date.now() > date.getTime()) continue

			if (NotificationsStore.currentLesson === lesson) continue

			runInAction(() => {
				NotificationsStore.currentLesson = lesson
			})

			const lessonName = getSubjectName({
				subjectId: lesson.subjectId,
				subjectName: lesson.subjectName,
			})

			await notifee.displayNotification({
				id: NotificationsStore.notifId,
				title: `${lessonName} | ${lesson.roomName ?? 'Нет кабинета'}`,
				body: `Урок ${lesson.start.toHHMM()} - ${lesson.end.toHHMM()}. ${
					period ? 'Перемена ' + period.getMinutes() + ' мин' : ''
				}`,
				android: {
					channelId: NotificationsStore.channelId,
				},
			})

			break
		}
	}, 1000)

	return () => {
		clearInterval(interval)
	}
})
