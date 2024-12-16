// Initial setup & polyfills & monitoring
import './src/utils/polyfill'

import './src/services/sentry'

import './src/utils/configure'

import { LANG } from './src/constants'

// External dependencies
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
import { Icon, PaperProvider, TouchableRipple } from 'react-native-paper'
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Components
import Header from './src/components/Header'
import Loading from './src/components/Loading'
import Toast from './src/components/Modal'

// Services
import { API } from './src/services/net-school/api'
import './src/services/notifications/setup'
import { SENTRY_ROUTING } from './src/services/sentry'

// State
import { Theme, ThemeStore } from './src/models/theme'
import { StudentsStore } from './src/services/net-school/store'

// Screens
import DiaryScreen from './src/screens/day/screen'
import LoginScreen from './src/screens/login/in'
import LogoutScreen from './src/screens/login/out'
import SettingsScreen from './src/screens/settings/screen'
import TotalsNavigation from './src/screens/totals/screen'

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

import * as SplashScreen from 'expo-splash-screen'

SplashScreen.setOptions({
	duration: 200,
	fade: true,
})

export default Sentry.wrap(
	observer(function App() {
		const navigation = useRef<NavigationContainerRef<ParamListBase>>(null)

		const { loading, theme } = ThemeStore.meta(Theme)
		if (loading) return AppStore.loadingTheme

		const ProvidedTheme = toJS(theme)
		return (
			<SafeAreaProvider>
				<PaperProvider theme={ProvidedTheme}>
					<StatusBar
						style={Theme.dark ? 'light' : 'dark'}
						hidden={false}
						{/*backgroundColor="transparent"*/}
					/>
					<NavigationContainer
						theme={ProvidedTheme}
						ref={navigation}
						onReady={() =>
							SENTRY_ROUTING.registerNavigationContainer(navigation)
						}
					>
						<Navigation />
					</NavigationContainer>
					<Toast />
				</PaperProvider>
			</SafeAreaProvider>
		)
	}),
)

// Show header when component's custom header is not rendered
// eslint-disable-next-line mobx/missing-observer
function AppScreenFallback(props: { fallback: React.ReactNode }) {
	return (
		<View>
			<Header title="Загрузка..." />
			{props.fallback}
		</View>
	)
}

const AppStore = new (class AppStore {
	constructor() {
		makeAutoObservable(this, { loadingTheme: false })
	}

	get fallback() {
		let Fallback: React.ReactNode | undefined
		if (!API.session) {
			Fallback = <Loading text="Авторизация..." />
		} else if (StudentsStore.fallback) {
			Fallback = StudentsStore.fallback
		}

		return Fallback && (() => <AppScreenFallback fallback={Fallback} />)
	}

	loadingTheme = (
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
})()

const Navigation = observer(function Navigation() {
	const FallbackScreen = AppStore.fallback

	return (
		<Tab.Navigator
			theme={toJS(ThemeStore.meta(Theme).theme)}
			sceneAnimationEnabled={true}
			sceneAnimationType={'shifting'}
			barStyle={{
				height: '7%',
				alignContent: 'center',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: Theme.colors.navigationBar,
			}}
			activeColor={Theme.colors.onPrimaryContainer}
			activeIndicatorStyle={{
				height: '120%',
			}}
			style={{
				backgroundColor: Theme.colors.primary,
			}}
			screenOptions={({ route }) => ({
				tabBarIcon: ({ color }) => (
					<Icon source={ScreenIcons[route.name]} color={color} size={23} />
				),
			})}
			// https://github.com/callstack/react-native-paper/issues/4401
			renderTouchable={({ key, ...props }) => (
				<TouchableRipple {...props} key={key} />
			)}
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
	)
})
