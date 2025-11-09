// Initial setup & polyfills & monitoring
import '@/utils/polyfill'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import '@/services/sentry'

import '@/utils/configure'

import { Logger, Screens } from '@/constants'

// External dependencies
import {
	BottomTabBarProps,
	BottomTabScreenProps,
	createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {
	CommonActions,
	DefaultTheme,
	NavigationContainer,
	NavigationContainerRef,
} from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import * as SplashScreen from 'expo-splash-screen'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { Easing, useWindowDimensions, View } from 'react-native'
import {
	BottomNavigation,
	Icon,
	PaperProvider,
	TouchableRipple,
} from 'react-native-paper'
import {
	SafeAreaProvider,
	useSafeAreaInsets,
} from 'react-native-safe-area-context'

// Components
import Header from '@/components/Header'
import Loading from '@/components/Loading'
import Toast from '@/components/Modal'

// Services
import { API } from '@/services/net-school/api'
import '@/services/notifications/setup'
import { SENTRY_ROUTING } from '@/services/sentry'

// State
import { Theme } from '@/models/theme'
import { StudentsStore } from '@/services/net-school/store'

// Screens
import DiaryScreen from '@/screens/day/screen'
import LoginScreen from '@/screens/login/in'
import SettingsScreen from '@/screens/settings/screen'
import TotalsNavigation from '@/screens/totals/screen'
import UsefullTools from '@/screens/usefull-tools/screen'

import type { TermNavigationParamMap } from '@/screens/totals/navigation'

type BottomTabsParams = Record<
	| Screens.LogIn
	| Screens.LogOut
	| Screens.Diary
	| Screens.Settings
	| Screens.UsefullTools,
	undefined
> & {
	[Screens.Totals]:
		| {
				screen: Screens.SubjectTotals
				params: TermNavigationParamMap[Screens.SubjectTotals]
		  }
		| undefined
}

export type XBottomTabScreenProps = BottomTabScreenProps<BottomTabsParams>

const ScreenIcons = {
	[Screens.LogIn]: 'login',
	[Screens.LogOut]: 'logout',
	[Screens.Diary]: 'book',
	[Screens.Totals]: 'school',
	[Screens.Settings]: 'cog',
	[Screens.UsefullTools]: 'tools',
}

// Refactored route configuration to be less repetitive
const AppRoutes = [
	{
		name: Screens.LogIn,
		component: LoginScreen,
		hideCondition: () => API.session,
	},
	{
		name: Screens.Diary,
		component: DiaryScreen,
		fallback: true,
	},
	{
		name: Screens.Totals,
		component: TotalsNavigation,
		fallback: true,
	},
	{
		name: Screens.Settings,
		component: SettingsScreen,
	},
	{
		name: Screens.UsefullTools,
		component: UsefullTools,
	},
]

const Tab = createBottomTabNavigator<BottomTabsParams>()

// Custom Tab Bar Component using BottomNavigation.Bar
const CustomTabBar = observer(function CustomTabBar({
	navigation,
	state,
	insets,
}: BottomTabBarProps) {
	return (
		<BottomNavigation.Bar
			navigationState={state}
			safeAreaInsets={insets}
			onTabPress={({ route, preventDefault }) => {
				const event = navigation.emit({
					type: 'tabPress',
					target: route.key,
					canPreventDefault: true,
				})

				if (event.defaultPrevented) {
					preventDefault()
				} else {
					navigation.dispatch({
						...CommonActions.navigate(route.name, route.params),
						target: state.key,
					})
				}
			}}
			renderIcon={({ route, color }) => {
				const iconName = ScreenIcons[route.name as keyof typeof ScreenIcons]
				return <Icon source={iconName} color={color} size={23} />
			}}
			getLabelText={({ route }) => route.name}
			activeColor={Theme.colors.onPrimaryContainer}
			inactiveColor={Theme.colors.onSurfaceVariant}
			style={{
				backgroundColor: Theme.colors.navigationBar,
			}}
			renderTouchable={props => <TouchableRipple {...props} key={props.key} />}
		/>
	)
})

export default Sentry.wrap(
	observer(function App() {
		const navigation = useRef<NavigationContainerRef<BottomTabsParams>>(null)

		Logger.info('APP LOAD THEME IS LOADING ' + Theme.manage.isLoading())

		if (Theme.manage.isLoading()) return <Loading text="Загрузка темы" />

		const ProvidedTheme = toJS(Theme.manage.getTheme())
		return (
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaProvider>
					<PaperProvider theme={ProvidedTheme}>
						<NavigationContainer
							theme={{
								...ProvidedTheme,
								fonts: DefaultTheme.fonts,
							}}
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
			</GestureHandlerRootView>
		)
	}),
)

const Navigation = observer(function Navigation() {
	Logger.info('NAVIGATION RENDER')

	let innerFallback: React.ReactNode | undefined
	if (!API.session) {
		innerFallback = <Loading text="Ожидание авторизации..." />
	} else if (StudentsStore.fallback) {
		innerFallback = StudentsStore.fallback
	}

	let FallbackScreen: React.FC | undefined
	if (innerFallback) {
		FallbackScreen = () => (
			<View>
				{/* Show header when component's custom header is not rendered */}
				<Header title="Загрузка..." />
				{innerFallback}
			</View>
		)
	}

	const { width } = useWindowDimensions()

	const insets = useSafeAreaInsets()
	useEffect(() => {
		Logger.info('SPLASH SCREEN HIDE')
		setTimeout(() => {
			SplashScreen.hide()
		}, 2000)
	}, [])

	return (
		<Tab.Navigator
			tabBar={props => <CustomTabBar {...props} />}
			safeAreaInsets={insets}
			screenOptions={{
				headerShown: false,
				// The problem with default animation is that after upgrading to expo sdk 54 from 52, react-navigation 7
				// and changing bottom tabs navigator from paper to rn navigation shadows are not affected by opacity
				// hence they flicker on screen. So instead we move the screen from the screen (lol)

				// Also i just found out that i like custom easing much more the default one
				animation: 'shift',
				transitionSpec: {
					animation: 'timing',
					config: {
						duration: 300,
						easing: Easing.out(Easing.exp), // Easing.elastic(1), // Easing.out(Easing.exp),
					},
				},
				sceneStyleInterpolator: ({ current }) => ({
					sceneStyle: {
						opacity: current.progress.interpolate({
							inputRange: [-1, 0, 1],
							outputRange: [1, 1, 1],
						}),
						transform: [
							{
								translateX: current.progress.interpolate({
									inputRange: [-1, 0, 1],
									outputRange: [-width, 0, width],
								}),
							},
						],
					},
				}),
			}}
		>
			{AppRoutes.map(route => {
				if (route.hideCondition?.()) return null

				return (
					<Tab.Screen
						key={route.name}
						name={route.name as keyof BottomTabsParams}
						component={
							route.fallback && FallbackScreen
								? FallbackScreen
								: route.component
						}
					/>
				)
			})}
		</Tab.Navigator>
	)
})
