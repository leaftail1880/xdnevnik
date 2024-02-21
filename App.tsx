import './src/Setup/logbox'

import './src/Setup/date'
import './src/Setup/sentry'

import { LANG } from './src/Setup/constants'

import {
	NavigationContainer,
	NavigationContainerRef,
} from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { StatusBar } from 'expo-status-bar'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { PaperProvider } from 'react-native-paper'
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Ionicon } from './src/Components/Icon'
import { Loading } from './src/Components/Loading'
import { API } from './src/NetSchool/api'
import { DiaryScreen } from './src/Screens/Diary/Screen'
import { LoginScreen } from './src/Screens/Session/login'
import { LogoutScreen } from './src/Screens/Session/logout'
import { SettingsScreen } from './src/Screens/Settings/index'
// import { TotalsNavigation } from './src/Screens/Totals'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'
import { Header } from './src/Components/Header'
import './src/Setup/notifications'
import { SENTRY_ROUTING } from './src/Setup/sentry'
import { ToastConfig } from './src/Setup/toast'
import { StudentsStore } from './src/Stores/API'
import { Theme, ThemeStore } from './src/Stores/Theme'

type ParamListBase = Record<
	(typeof LANG)[
		| 's_log_in'
		| 's_log_out'
		| 's_totals'
		| 's_settings'
		| 's_diary'],
	undefined
>
const Tab = createMaterialBottomTabNavigator<ParamListBase>()

export default Sentry.wrap(
	observer(function App() {
		const navigation = useRef<NavigationContainerRef<ParamListBase>>(null)

		if (!ThemeStore.meta(Theme).loaded)
			return (
				<View
					style={{
						height: '100%',
						width: '100%',
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Loading text="Загрузка темы" />
				</View>
			)

		let Fallback: React.FC | undefined
		if (!API.session) {
			// eslint-disable-next-line mobx/missing-observer
			Fallback = function Fallback() {
				return <Loading text="Авторизация{dots}" />
			}
		} else if (StudentsStore.fallback) {
			// eslint-disable-next-line mobx/missing-observer, @typescript-eslint/no-unused-vars
			Fallback = function Fallback() {
				return StudentsStore.fallback
			}
		}
		const FallbackScreen =
			Fallback &&
			// eslint-disable-next-line mobx/missing-observer
			function AppFallback() {
				return (
					Fallback && (
						<View>
							<Header title="Загрузка..." />
							<Fallback />
						</View>
					)
				)
			}

		const theme = toJS(ThemeStore.meta(Theme).theme)
		return (
			<SafeAreaProvider>
				<PaperProvider theme={theme}>
					<StatusBar style={Theme.dark ? 'light' : 'dark'} />
					<NavigationContainer
						theme={theme}
						ref={navigation}
						onReady={() => {
							SENTRY_ROUTING.registerNavigationContainer(navigation)
						}}
					>
						<Tab.Navigator
							sceneAnimationEnabled={true}
							sceneAnimationType={'shifting'}
							shifting
							barStyle={{
								height: '7%',
								padding: 0,
								margin: 0,
								alignContent: 'center',
								alignItems: 'center',
								justifyContent: 'center',
							}}
							inactiveColor={Theme.colors.surfaceDisabled}
							activeColor={Theme.colors.onPrimaryContainer}
							activeIndicatorStyle={{
								backgroundColor: Theme.colors.primaryContainer,
								height: '120%',
								margin: 0,
								padding: 0,
							}}
							style={{
								padding: 0,
								margin: 0,
							}}
							screenOptions={({ route }) => ({
								tabBarIcon: ({ focused, color }) => {
									let iconName = {
										[LANG['s_log_in']]: 'log-in',
										[LANG['s_log_out']]: 'log-out',
										[LANG['s_diary']]: 'time',
										[LANG['s_totals']]: 'school',
										[LANG['s_settings']]: 'settings',
									}[route.name]
									if (focused) iconName += '-outline'
									return <Ionicon name={iconName} color={color} size={23} />
								},
								tabBarHideOnKeyboard: true,
							})}
						>
							{!API.session && (
								<Tab.Screen name={LANG['s_log_in']} component={LoginScreen} />
							)}

							<Tab.Screen
								name={LANG['s_diary']}
								component={FallbackScreen || DiaryScreen}
							/>

							{/* <Tab.Screen
								name={LANG['s_totals']}
								// Show header when component's custom header is not rendered
								// options={{ headerShown: !!Fallback }}
								component={Fallback || TotalsNavigation}
							/> */}

							<Tab.Screen
								name={LANG['s_settings']}
								component={SettingsScreen}
							></Tab.Screen>

							{API.session && (
								<Tab.Screen name={LANG['s_log_out']} component={LogoutScreen} />
							)}
						</Tab.Navigator>
					</NavigationContainer>
					<Toast config={ToastConfig} />
				</PaperProvider>
			</SafeAreaProvider>
		)
	})
)
