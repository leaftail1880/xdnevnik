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
import { makeAutoObservable, toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { View } from 'react-native'
import { Icon, PaperProvider } from 'react-native-paper'
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Header from './src/Components/Header'
import Loading from './src/Components/Loading'
import Toast from './src/Components/Modal'
import { API } from './src/NetSchool/api'
import DiaryScreen from './src/Screens/Diary/Screen'
import LoginScreen from './src/Screens/Login/in'
import LogoutScreen from './src/Screens/Login/out'
import SettingsScreen from './src/Screens/Settings/index'
import TotalsNavigation from './src/Screens/Totals/index'
import { SENTRY_ROUTING } from './src/Setup/sentry'
import { StudentsStore } from './src/Stores/NetSchool'
import { Theme, ThemeStore } from './src/Stores/Theme'

import './src/NetSchool/autologin'
import './src/Setup/notifications'

export type ParamListBase = Record<
	(typeof LANG)[
		| 's_log_in'
		| 's_log_out'
		| 's_totals'
		| 's_settings'
		| 's_diary'],
	undefined
>

const ScreenIcons = {
	[LANG['s_log_in']]: 'login',
	[LANG['s_log_out']]: 'logout',
	[LANG['s_diary']]: 'book',
	[LANG['s_totals']]: 'school',
	[LANG['s_settings']]: 'cog',
}

const Tab = createMaterialBottomTabNavigator<ParamListBase>()

const AppStore = new (class {
	constructor() {
		makeAutoObservable(this)
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	get Fallback() {
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

		return (
			Fallback && (() => Fallback && <AppFallback fallback={<Fallback />} />)
		)
	}
})()

// Show header when component's custom header is not rendered
const AppFallback = observer(function AppFallback(props: {
	fallback: React.ReactNode
}) {
	return (
		<View>
			<Header title="Загрузка..." />
			{props.fallback}
		</View>
	)
})

export default Sentry.wrap(
	observer(function App() {
		const navigation = useRef<NavigationContainerRef<ParamListBase>>(null)
		const FallbackScreen = AppStore.Fallback
		Theme.key

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
							barStyle={{
								height: '7%',
								padding: 0,
								margin: 0,
								alignContent: 'center',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: Theme.colors.elevation.level2,
							}}
							inactiveColor={Theme.colors.onSurfaceVariant}
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
								tabBarIcon: ({ color }) => {
									return (
										<Icon
											source={ScreenIcons[route.name]}
											color={color}
											size={23}
										/>
									)
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

							<Tab.Screen
								name={LANG['s_totals']}
								component={FallbackScreen || TotalsNavigation}
							/>

							<Tab.Screen
								name={LANG['s_settings']}
								component={SettingsScreen}
							></Tab.Screen>

							{API.session && (
								<Tab.Screen name={LANG['s_log_out']} component={LogoutScreen} />
							)}
						</Tab.Navigator>
					</NavigationContainer>
					<Toast />
				</PaperProvider>
			</SafeAreaProvider>
		)
	})
)
