import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { Alert, Platform } from 'react-native'
import { Colors } from 'react-native-ui-lib'
import { LOGGER } from './constants'

export function setupNotifications(enabled: boolean) {
	;(async function setupNotifications() {
		if (Platform.OS === 'android')
			await Notifications.setNotificationChannelAsync('default', {
				name: 'Уроки',
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: Colors.$iconPrimary,
			})

		if (!enabled) return

		if (Device.isDevice) {
			let res = await Notifications.getPermissionsAsync()

			if (res.status !== 'granted') {
				res = await Notifications.requestPermissionsAsync()
			}

			if (res.status !== 'granted') {
				Alert.alert('Включи уведомления!')
				return
			}
		} else Alert.alert('Уведомления недоступны вне устройства')
	})()

	const responseListener =
		Notifications.addNotificationResponseReceivedListener(action => {
			LOGGER.info('Notification interact', action)
		})

	return () => {
		Notifications.removeNotificationSubscription(responseListener)
	}
}
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
})
