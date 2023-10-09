import AsyncStorage from '@react-native-async-storage/async-storage'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { Alert, Platform } from 'react-native'
import 'react-native-gesture-handler'
import Ionicons from 'react-native-vector-icons/Ionicons'
import NetSchoolApi, { API } from './src/NetSchool/api'
import { ROUTES } from './src/NetSchool/routes'
import {
	LANG,
	ACCENT_COLOR,
	NOTIFICATION_COLOR,
	SECONDARY_COLOR,
} from './src/constants'
import { useAsync } from './src/hooks/async'
import { setupSettings } from './src/hooks/settings'
import { DiaryScreen } from './src/screens/diary'
import { HomeworkScreen } from './src/screens/homework'
import { LoginScreen } from './src/screens/login'
import { LogoutScreen } from './src/screens/logout'
import { SettingsScreen } from './src/screens/settings'
import { TotalsScreen } from './src/screens/totals'

console.log(' ')
console.log(' ')
console.log('reload')
console.log(' ')

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
})

const Tab = createBottomTabNavigator()

export default function App() {
	const [settings, SettingsProvider] = setupSettings()
	const [loggingIn, setLoggingIn] = useState(false)

	const students = useAsync(() => API.students(), [API.changes])
	const student = students && students[settings.studentIndex]
	const studentId = student && student.studentId

	const diary = useAsync(
		() => API.diary({ studentId }),
		[API.changes, studentId]
	)

	useEffect(() => {
		console.log('effect::setup, loggingIn: ' + loggingIn)
		;(async function loadCache() {
			const raw = await AsyncStorage.getItem('cache')
			if (raw) API.cache = JSON.parse(raw)
		})()

		// Session
		;(async function restoreSessionEffect() {
			if (!API.loggedIn) {
				setLoggingIn(true)
				const loadedEndpoint = await AsyncStorage.getItem('endpoint')
				const loadedSession = await AsyncStorage.getItem('session')
				if (loadedSession && loadedEndpoint) {
					API.setEndpoint(loadedEndpoint)

					const oldSession = JSON.parse(
						loadedSession
					) as NetSchoolApi['session']

					const newSession = await API.getToken(
						ROUTES.getRefreshTokenTemplate(oldSession.refresh_token)
					)

					await AsyncStorage.setItem('session', JSON.stringify(newSession))
				}
				setLoggingIn(false)
			}
		})().catch(error => {
			setLoggingIn(false)
			console.error('Auth error', error)
			Alert.alert('Ошибка при авторизации', error + '')
		})

		// Notifs
		;(async function setupNotifications() {
			if (Platform.OS === 'android')
				await Notifications.setNotificationChannelAsync('default', {
					name: 'Default',
					importance: Notifications.AndroidImportance.MAX,
					vibrationPattern: [0, 250, 250, 250],
					lightColor: NOTIFICATION_COLOR,
				})

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
				console.log('Notification interact', action)
			})

		return () => {
			Notifications.removeNotificationSubscription(responseListener)
		}
	}, [])

	useEffect(() => {
		console.log('useEffect::notifications')
		if (!settings.notifications) {
			console.log('notifications are disabled')
			Notifications.cancelAllScheduledNotificationsAsync()
			return
		}

		if (diary) {
			Notifications.cancelAllScheduledNotificationsAsync().then(() => {
				for (const [i, lesson] of diary.lessons.entries()) {
					let period: Date
					let date: Date
					const previous = diary.lessons[-i]

					if (
						previous &&
						lesson.start.toYYYYMMDD() === previous.day.toYYYYMMDD()
					) {
						// If previous lesson in the same day, send notification in the end of it
						date = previous.end
						period = new Date(lesson.start.getTime() - previous.end.getTime())
					} else {
						date = lesson.start
						// Send by 5 mins before lesson
						date.setMinutes(date.getMinutes() - 15)
					}

					Notifications.scheduleNotificationAsync({
						content: {
							title: `${lesson.subjectName} | ${
								lesson.roomName ?? 'Нет кабинета'
							}`,
							body: `Время урока ${lesson.start.toHHMM()} - ${lesson.end.toHHMM()}. ${
								period ? 'Сейчас перемена ' + period.getMinutes() + ' мин' : ''
							}`,
							sound: false,
						},
						trigger: {
							repeats: true,
							weekday: date.getDay() + 1,
							hour: date.getHours(),
							minute: date.getMinutes(),
						},
					}).then(e => {
						console.log('Shedulled notification', e)
					})
				}
			})
		}
	}, [settings.notifications, diary])

	return (
		<NavigationContainer>
			<SettingsProvider>
				<Tab.Navigator
					screenOptions={({ route }) => ({
						tabBarIcon: ({ focused, color, size }) => {
							let iconName = {
								[LANG['s_log_in']]: 'log-in',
								[LANG['s_log_out']]: 'log-out',
								[LANG['s_diary']]: 'time',
								[LANG['s_totals']]: 'school',
								[LANG['s_homework']]: 'document',
								[LANG['s_settings']]: 'settings',
							}[route.name]
							if (focused) iconName += '-outline'
							return <Ionicons name={iconName} size={size} color={color} />
						},
						tabBarActiveTintColor: ACCENT_COLOR,
						tabBarInactiveTintColor: SECONDARY_COLOR,
					})}
				>
					{!API.loggedIn && (
						<Tab.Screen name={LANG['s_log_in']}>
							{() => LoginScreen({ loggingIn, setLoggingIn })}
						</Tab.Screen>
					)}

					<Tab.Screen name={LANG['s_diary']}>
						{() => DiaryScreen({ diary })}
					</Tab.Screen>
					<Tab.Screen name={LANG['s_homework']}>
						{() => HomeworkScreen({ studentId })}
					</Tab.Screen>
					<Tab.Screen name={LANG['s_totals']}>
						{() => TotalsScreen({ studentId })}
					</Tab.Screen>
					<Tab.Screen name={LANG['s_settings']}>
						{() => SettingsScreen({ students })}
					</Tab.Screen>

					{API.loggedIn && (
						<Tab.Screen name={LANG['s_log_out']} component={LogoutScreen} />
					)}
				</Tab.Navigator>
			</SettingsProvider>
		</NavigationContainer>
	)
}
