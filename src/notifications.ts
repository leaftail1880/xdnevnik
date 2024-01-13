import notifee, {
	AndroidImportance,
	AuthorizationStatus,
} from '@notifee/react-native'
import * as Device from 'expo-device'
import { autorun, makeAutoObservable, reaction, runInAction, toJS } from 'mobx'
import { Alert } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { getSubjectName } from './Components/SubjectName'
import { DiaryStore } from './Screens/Diary/stores'
import { Settings } from './Stores/Settings.store'

const NotificationsStore = makeAutoObservable({
	channelId: '',
	notifId: '',
	currentLesson: '',
})

reaction(
	() => Settings.notifications,
	async function notificationSetup(enabled) {
		// Show notification channels even when they are disabled
		const channelId = await notifee.createChannel({
			id: 'lessons',
			name: 'Уроки',
			importance: AndroidImportance.HIGH,
			lightColor: Colors.$iconPrimary,
		})

		if (!enabled) {
			if (NotificationsStore.notifId) {
				await notifee.cancelNotification(NotificationsStore.notifId)
				runInAction(() => (NotificationsStore.notifId = ''))
			}
			return
		}
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

		const notifs = (await notifee.getDisplayedNotifications()).find(
			e => e.notification.android?.channelId === channelId
		)

		const notificationId = notifs?.id
			? notifs.id
			: await notifee.displayNotification({
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
	}
)

let interval: ReturnType<typeof setInterval>

autorun(function notificationFromDiary() {
	if (interval) clearInterval(interval)
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

	interval = setInterval(async () => {
		const date = new Date()
		date.setHours(8, 41)
		const now = date.getTime()

		for (const [i, lesson] of diary.lessons.entries()) {
			if (!lesson.end || !lesson.start) continue
			if (now > lesson.end.getTime()) continue

			let period: Date | undefined
			let date: Date
			const previous = diary.lessons[i - 1]

			if (previous && lesson.day.toYYYYMMDD() === previous.day.toYYYYMMDD()) {
				// If previous lesson in the same day, send notification in the end of it
				date = new Date(previous.end)
				date.setMinutes(date.getMinutes() + 1)
				period = new Date(lesson.start.getTime() - previous.end.getTime())
			} else {
				date = new Date(lesson.start)
				// Send by 15 mins before lesson
				date.setMinutes(date.getMinutes() - 15)
			}

			if (now < date.getTime()) continue

			const uuid = lesson.classmeetingId + '' + lesson.subjectId
			if (NotificationsStore.currentLesson === uuid) continue
			runInAction(() => {
				NotificationsStore.currentLesson = uuid
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
})
