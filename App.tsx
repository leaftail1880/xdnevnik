import AsyncStorage from '@react-native-async-storage/async-storage'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Alert, Platform } from 'react-native'
import 'react-native-gesture-handler'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { API } from './src/NetSchool/api'
import { Student } from './src/NetSchool/classes'
import {
	ACCENT_COLOR,
	LANG,
	NOTIFICATION_COLOR,
	SECONDARY_COLOR,
} from './src/constants'
import { AsyncState, useAsync } from './src/hooks/async'
import { useSettingProvider } from './src/hooks/settings'
import { DiaryScreen } from './src/screen/diary'
import { HomeworkScreen } from './src/screen/homework'
import { LoginScreen } from './src/screen/login'
import { LogoutScreen } from './src/screen/logout'
import { SettingsScreen } from './src/screen/settings'
import { TotalsNavigation } from './src/screen/totals'

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
	const [loggedIn, setLoggedIn] = useState(false)
	API.loggedState = {
		setter: setLoggedIn,
		getter: () => loggedIn,
	}
	const settings = useSettingProvider()

	const [students, StudentFallback] = useAsync(
		() => API.students(),
		'списка учеников',
		[API.changes]
	)
	const student = students && students[settings.studentIndex]
	const studentId = student && student.studentId

	useEffect(() => {
		;(async function loadCache() {
			const raw = await AsyncStorage.getItem('cache')
			if (raw) API.cache = JSON.parse(raw)
		})()
	}, [])

	useEffect(() => {
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

	return (
		<NavigationContainer>
			<StatusBar hidden={false} translucent={true} style="dark" />
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
						return <Ionicons name={iconName!} size={size} color={color} />
					},
					tabBarActiveTintColor: ACCENT_COLOR,
					tabBarInactiveTintColor: SECONDARY_COLOR,
				})}
			>
				{!API.loggedIn && (
					<Tab.Screen name={LANG['s_log_in']}>
						{() => <LoginScreen />}
					</Tab.Screen>
				)}

				<Tab.Screen name={LANG['s_diary']}>
					{() => <DiaryScreen ctx={{ settings, studentId }} />}
				</Tab.Screen>
				<Tab.Screen name={LANG['s_homework']}>
					{() => StudentFallback || <HomeworkScreen ctx={{ studentId }} />}
				</Tab.Screen>
				<Tab.Screen name={LANG['s_totals']} options={{ headerShown: false }}>
					{props => <TotalsNavigation ctx={{ studentId }} {...props} />}
				</Tab.Screen>
				<Tab.Screen name={LANG['s_settings']}>
					{() => (
						<SettingsScreen
							ctx={{
								students: [students, StudentFallback] as AsyncState<Student[]>,
								settings,
							}}
						/>
					)}
				</Tab.Screen>

				{API.loggedIn && (
					<Tab.Screen name={LANG['s_log_out']} component={LogoutScreen} />
				)}
			</Tab.Navigator>
		</NavigationContainer>
	)
}