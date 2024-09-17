import notifee, { AuthorizationStatus } from '@notifee/react-native'
import * as Device from 'expo-device'
import { autorun } from 'mobx'
import { Settings } from '~models/settings'
import { Toast } from '../../utils/Toast'
import { setupLessonChannel } from './lesson'
import { setupMarksChannel } from './marks'

notifee.onBackgroundEvent(async () => {
	// TODO React on event, e.g. open approprietary screen etc
})

autorun(function lessonNotificationSetup() {
	setupLessonChannel(Settings.notificationsEnabled)
	setupMarksChannel()

	if (Device.isDevice) {
		// Required for iOS
		// See https://notifee.app/react-native/docs/ios/permissions
		notifee.requestPermission().then(({ authorizationStatus }) => {
			if (authorizationStatus === AuthorizationStatus.DENIED) {
				// Permission denied, disable
				Settings.save({ notificationsEnabled: false })
			}
		})
	} else {
		// Not an device, show error toast and disable
		Toast.show({ title: 'Уведомления недоступны вне устройства', error: true })
		Settings.save({ notificationsEnabled: false })
	}
})