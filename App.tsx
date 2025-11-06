// Initial setup & polyfills & monitoring
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import './src/utils/polyfill'

import './src/services/sentry'

import './src/utils/configure'

import { Screens } from './src/constants'

// External dependencies
import {
	BottomTabBarProps,
	createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {
	CommonActions,
	DefaultTheme,
	NavigationContainer,
	NavigationContainerRef,
} from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import * as Sentry from '@sentry/react-native'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { View } from 'react-native'
import {
	BottomNavigation,
	Icon,
	PaperProvider,
	TouchableRipple,
} from 'react-native-paper'
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
import SettingsScreen from './src/screens/settings/screen'
import TotalsNavigation from './src/screens/totals/screen'
import UsefullTools from './src/screens/usefull-tools/screen'

import type { TermNavigationParamMap } from '@/screens/totals/navigation'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.setOptions({
	duration: 400,
	fade: true,
})

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

export type BottomTabsScreenProps = StackScreenProps<BottomTabsParams>

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
				height: 65, // Fixed height instead of percentage
			}}
			renderTouchable={props => <TouchableRipple {...props} key={props.key} />}
		/>
	)
})

export default Sentry.wrap(
	observer(function App() {
		const navigation = useRef<NavigationContainerRef<BottomTabsParams>>(null)

		const { loading, theme } = ThemeStore.meta(Theme)
		if (loading) return <Loading text="Загрузка темы" />

		const ProvidedTheme = toJS(theme)
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

	return (
		<Tab.Navigator
			tabBar={props => <CustomTabBar {...props} />}
			screenOptions={{
				headerShown: false,
				animation: 'shift',
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
