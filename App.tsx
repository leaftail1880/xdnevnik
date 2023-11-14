import AsyncStorage from '@react-native-async-storage/async-storage'
import {
	BottomTabBar,
	createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {
	DarkTheme,
	DefaultTheme,
	NavigationContainer,
	NavigationContainerRef,
	Theme,
} from '@react-navigation/native'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import {
	Alert,
	Platform,
	TouchableOpacity,
	View,
	useColorScheme,
} from 'react-native'
import 'react-native-gesture-handler'
import { API } from './src/NetSchool/api'
import { ReactStateHook } from './src/NetSchool/classes'
import { ROUTES } from './src/NetSchool/routes'
import { Button } from './src/components/button'
import { Ionicon } from './src/components/icon'
import { Loading } from './src/components/loading'
import { Text } from './src/components/text'
import {
	ACCENT_COLOR,
	LANG,
	LOGGER,
	NOTIFICATION_COLOR,
	RED_ACCENT_COLOR,
	SECONDARY_COLOR,
	styles,
} from './src/constants'
import { useAPI } from './src/hooks/api'
import { CTX, useSetupSettings } from './src/hooks/settings'
import { DiaryScreen } from './src/screen/diary'
import { HomeworkScreen } from './src/screen/homework'
import { LoginScreen } from './src/screen/login'
import { LogoutScreen } from './src/screen/logout'
import { SettingsScreen } from './src/screen/settings'
import { TotalsNavigation } from './src/screen/totals'

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
})

type ParamListBase = Record<
	(typeof LANG)[
		| 's_log_in'
		| 's_log_out'
		| 's_totals'
		| 's_settings'
		| 's_homework'
		| 's_diary'],
	undefined
>
const Tab = createBottomTabNavigator<ParamListBase>()

export default function App() {
	API.hookReactState(useState<ReactStateHook>())
	const settings = useSetupSettings()

	const students = useAPI(API, 'students', undefined, 'списка учеников')
	const student = students.result && students.result[settings.studentIndex]
	const studentId = student && student.studentId

	useEffect(() => {
		;(async function loadCache() {
			const raw = await AsyncStorage.getItem('cache')
			if (raw) API.cache = JSON.parse(raw)
		})()
	}, [])

	useEffect(() => {
		;(async function setupNotifications() {
			if (Platform.OS === 'android')
				await Notifications.setNotificationChannelAsync('default', {
					name: 'Уроки',
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
				LOGGER.info('Notification interact', action)
			})

		return () => {
			Notifications.removeNotificationSubscription(responseListener)
		}
	}, [])

	const systemScheme = useColorScheme()
	let theme: Theme
	if (typeof settings.theme === 'object') {
		theme = settings.theme
	} else {
		const actual = settings.theme === 'system' ? systemScheme : settings.theme
		theme = actual === 'light' ? DefaultTheme : DarkTheme
	}

	const WaitForAuthorization = !API.session && (
		<Loading text="Ожидание авторизации{dots}" />
	)

	const navigation = useRef<NavigationContainerRef<ParamListBase>>(null)
	const [status, setStatus] = useState<
		{ content: React.ReactNode; error: boolean } | undefined
	>()
	const sended = useRef<boolean>()
	useEffect(() => {
		if (!API.authorized && API.session?.refresh_token && !sended.current) {
			sended.current = true
			API.getToken(
				ROUTES.refreshTokenTemplate(API.session.refresh_token),
				'Ошибка авторизации, перезайдите'
			)
				.then(() => {
					if (status) {
						setStatus({ content: 'Вы авторизовались.', error: false })
						setTimeout(() => setStatus(undefined), 5000)
					}
				})
				.catch(e => {
					if (
						e instanceof TypeError &&
						e.message.includes('Network request failed')
					)
						e = 'Нет интернета.'
					setStatus({ content: (e + '').replace(/^Error: /, ''), error: true })
				})
		}
	})

	return (
		<CTX.Provider
			value={{
				settings,
				studentId,
				students,
				setStatus
			}}
		>
			<NavigationContainer theme={theme} ref={navigation}>
				<StatusBar translucent={true} style={theme.dark ? 'light' : 'dark'} />
				<Tab.Navigator
					tabBar={props => {
						return (
							<View>
								{status && (
									<View
										style={[
											styles.stretch,
											{
												elevation: 3,
												minHeight: 30,
												backgroundColor: status.error
													? RED_ACCENT_COLOR
													: theme.colors.card,
											},
										]}
									>
										<Text style={{ fontSize: 15 }}>{status.content}</Text>
										{status.error && (
											<Button
												onPress={() => {
													sended.current = false
													API.updateEffects++
												}}
											>
												<Ionicon name="reload" size={15} />
											</Button>
										)}
									</View>
								)}
								<BottomTabBar {...props} />
							</View>
						)
					}}
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
							return <Ionicon name={iconName} size={size} color={color} />
						},
						tabBarActiveTintColor: ACCENT_COLOR,
						tabBarInactiveTintColor: SECONDARY_COLOR,
						tabBarButton: props => <TouchableOpacity {...props} />,
						tabBarHideOnKeyboard: true,
					})}
				>
					{!API.session && (
						<Tab.Screen name={LANG['s_log_in']}>
							{() => <LoginScreen />}
						</Tab.Screen>
					)}

					<Tab.Screen name={LANG['s_diary']}>
						{() => WaitForAuthorization || students.fallback || <DiaryScreen />}
					</Tab.Screen>
					<Tab.Screen name={LANG['s_homework']}>
						{() =>
							WaitForAuthorization || students.fallback || <HomeworkScreen />
						}
					</Tab.Screen>
					<Tab.Screen name={LANG['s_totals']} options={{ headerShown: false }}>
						{() => (
							<TotalsNavigation
								fallbacks={{
									auth: WaitForAuthorization,
									students: students.fallback,
								}}
							/>
						)}
					</Tab.Screen>
					<Tab.Screen name={LANG['s_settings']}>
						{() => <SettingsScreen />}
					</Tab.Screen>

					{API.session && (
						<Tab.Screen name={LANG['s_log_out']}>
							{() => <LogoutScreen />}
						</Tab.Screen>
					)}
				</Tab.Navigator>
			</NavigationContainer>
		</CTX.Provider>
	)
}
