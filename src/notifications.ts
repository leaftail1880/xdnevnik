import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { autorun, toJS } from 'mobx'
import { Alert, Platform } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { getSubjectName } from './Components/SubjectName'
import { DiaryStore } from './Screens/Diary/stores'
import { Settings } from './Stores/Settings.store'

autorun(async function notificationSetup() {
	if (Platform.OS === 'android') {
		// Show notification channels even when they are disabled
		await Notifications.setNotificationChannelAsync('default', {
			name: 'Уроки',
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: Colors.$iconPrimary,
		})
	}

	if (!Settings.notifications) return
	if (Device.isDevice) {
		let response = await Notifications.getPermissionsAsync()

		if (response.status !== 'granted') {
			response = await Notifications.requestPermissionsAsync()
		}

		if (response.status !== 'granted') {
			Alert.alert('Включи уведомления!')
			return
		}
	} else Alert.alert('Уведомления недоступны вне устройства')
})

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
})

autorun(function notificationFromDiary() {
	if (!Settings.notifications) {
		Notifications.cancelAllScheduledNotificationsAsync()
		return
	}

	const { result } = DiaryStore.withoutParams()
	if (!result) return
	const diary = toJS(result)

	Notifications.cancelAllScheduledNotificationsAsync().then(() => {
		for (const [i, lesson] of diary.lessons.entries()) {
			let period: Date | undefined
			let date: Date
			const previous = diary.lessons[i - 1]

			if (previous && lesson.day.toYYYYMMDD() === previous.day.toYYYYMMDD()) {
				// If previous lesson in the same day, send notification in the end of it
				date = previous.end
				period = new Date(lesson.start.getTime() - previous.end.getTime())
			} else {
				date = lesson.start
				// Send by 5 mins before lesson
				date.setMinutes(date.getMinutes() - 15)
			}

			const lessonName = getSubjectName({
				subjectId: lesson.subjectId,
				subjectName: lesson.subjectName,
			})

			Notifications.scheduleNotificationAsync({
				content: {
					title: `${lessonName} | ${lesson.roomName ?? 'Нет кабинета'}`,
					body: `Урок ${lesson.start.toHHMM()} - ${lesson.end.toHHMM()}. ${
						period ? 'Перемена ' + period.getMinutes() + ' мин' : ''
					}`,
					sound: false,
				},
				trigger: {
					repeats: true,
					weekday: date.getDay() + 1,
					hour: date.getHours(),
					minute: date.getMinutes(),
				},
			})
		}
	})
})
