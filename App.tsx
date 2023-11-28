import AsyncStorage from '@react-native-async-storage/async-storage'
import {
	BottomTabBar,
	createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {
	NavigationContainer,
	NavigationContainerRef,
	Theme,
} from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import { TouchableOpacity, View, useColorScheme } from 'react-native'
import { Colors, Scheme } from 'react-native-ui-lib'
import { API, NetSchoolApi } from './src/NetSchool/api'
import { ReactStateHook } from './src/NetSchool/classes'
import { ROUTES } from './src/NetSchool/routes'
import { Button } from './src/components/Button'
import { Ionicon } from './src/components/Icon'
import { Loading } from './src/components/Loading'
import { Text } from './src/components/Text'
import {
	ACCENT_COLOR,
	LANG,
	RED_ACCENT_COLOR,
	Status,
	styles,
} from './src/constants'
import { useAPI } from './src/hooks/api'
import { Ctx, useSetupSettings } from './src/hooks/settings'
import { setupNotifications } from './src/notifications'
import { DiaryScreen } from './src/screen/diary'
import { LoginScreen } from './src/screen/login'
import { LogoutScreen } from './src/screen/logout'
import { SettingsScreen } from './src/screen/settings'
import { TotalsNavigation } from './src/screen/totals'

Colors.loadDesignTokens({ primaryColor: ACCENT_COLOR })
type ParamListBase = Record<
	(typeof LANG)[
		| 's_log_in'
		| 's_log_out'
		| 's_totals'
		| 's_settings'
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
		AsyncStorage.getItem('cache').then(
			cache => cache && (API.cache = JSON.parse(cache))
		)
	}, [])

	useEffect(
		() => setupNotifications(settings.notifications),
		[settings.notifications]
	)

	const systemScheme = useColorScheme() ?? 'light'
	const scheme: 'dark' | 'light' =
		settings.theme === 'system' ? systemScheme : settings.theme

	const oldScheme = useRef(scheme)
	if (oldScheme.current !== scheme) {
		Scheme.setScheme(scheme)
		oldScheme.current = scheme
	}

	const theme: Theme = {
		dark: scheme === 'dark',
		colors: {
			background: Colors.$backgroundDefault,
			border: Colors.$backgroundElevated,
			card: Colors.$backgroundPrimaryLight,
			notification: ACCENT_COLOR,
			primary: ACCENT_COLOR,
			text: Colors.$textDefault,
		},
	}

	const [status, setStatus] = useState<Status>()
	const sended = useRef<boolean>()
	useEffect(() => {
		// Not loaded
		if (!API.session) return

		// Already authorized
		if (API.authorized) return

		// Already sent auth req
		if (sended.current) return

		// Session is still active
		if (API.session.expires.getTime() > Date.now()) {
			API.authorized = true
			return
		}

		sended.current = true
		API.getToken(
			ROUTES.refreshTokenTemplate(API.session.refresh_token),
			'Ошибка авторизации, перезайдите. Код ошибки 400'
		)
			.then(() => {
				if (status) {
					setStatus({ content: 'Вы авторизовались.', error: false })
					setTimeout(() => setStatus(undefined), 5000)
				}
			})
			.catch(e => {
				setStatus({ content: NetSchoolApi.stringifyError(e), error: true })
			})
	})

	const navigation = useRef<NavigationContainerRef<ParamListBase>>(null)
	const WaitForAuthorization = !API.session && (
		<Loading text="Ожидание авторизации{dots}" />
	)

	return (
		<Ctx.Provider
			value={{
				settings,
				studentId,
				students,
				setStatus,
			}}
		>
			<NavigationContainer theme={theme} ref={navigation}>
				<StatusBar translucent={true} style={scheme} />
				<Tab.Navigator
					tabBar={props => (
						<View>
							{status && (
								<StatusBadge
									status={status}
									theme={theme}
									reset={() => {
										sended.current = false
										API.updateEffects++
									}}
								/>
							)}
							<BottomTabBar {...props} />
						</View>
					)}
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
						tabBarInactiveTintColor: Colors.$iconDefault,
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
					<Tab.Screen name={LANG['s_totals']} options={{ headerShown: false }}>
						{() =>
							WaitForAuthorization || students.fallback || <TotalsNavigation />
						}
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
		</Ctx.Provider>
	)
}

function StatusBadge({
	status,
	theme,
	reset,
}: {
	status: NonNullable<Status>
	theme: Theme
	reset: () => void
}) {
	return (
		<View
			style={[
				styles.stretch,
				{
					elevation: 3,
					minHeight: 30,
					backgroundColor: status.error ? RED_ACCENT_COLOR : theme.colors.card,
				},
			]}
		>
			<Text style={{ fontSize: 15 }}>{status.content}</Text>
			{status.error && (
				<Button onPress={reset}>
					<Ionicon name="reload" size={15} color={theme.colors.text} />
				</Button>
			)}
		</View>
	)
}
