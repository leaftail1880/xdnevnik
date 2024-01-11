import {
	BottomTabBar,
	createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {
	NavigationContainer,
	NavigationContainerRef,
} from '@react-navigation/native'
import 'expo-dev-client'
import { StatusBar } from 'expo-status-bar'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { Colors, LoaderScreen } from 'react-native-ui-lib'
import { Ionicon } from './src/Components/Icon'
import { Loading } from './src/Components/Loading'
import { StatusBadge } from './src/Components/StatusBadge'
import { API } from './src/NetSchool/api'
import { DiaryScreen } from './src/Screens/Diary'
import { LoginScreen } from './src/Screens/Session/login'
import { LogoutScreen } from './src/Screens/Session/logout'
import { SettingsScreen } from './src/Screens/Settings'
import { TotalsNavigation } from './src/Screens/Totals'
import { StudentsStore } from './src/Stores/StudentsStore'
import { Theme } from './src/Stores/Theme.store'
import { LANG } from './src/constants'

if (__DEV__) {
	import('./ReactotronConfig')
}

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

export default observer(function App() {
	const navigation = useRef<NavigationContainerRef<ParamListBase>>(null)

	if (!Theme.loaded) return <LoaderScreen />

	// Rerender on accent color change
	// idk why its not subscribing to it be default
	Theme.accentColor

	const students = StudentsStore
	const Fallback =
		(!API.session && <Loading text="Авторизация{dots}" />) || students.fallback

	return (
		<NavigationContainer theme={toJS(Theme.theme)} ref={navigation}>
			<StatusBar
				translucent={true}
				style={Theme.scheme === 'dark' ? 'light' : 'dark'}
			/>
			<Tab.Navigator
				tabBar={props => (
					<View>
						<StatusBadge />
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
							[LANG['s_settings']]: 'settings',
						}[route.name]
						if (focused) iconName += '-outline'
						return <Ionicon name={iconName} size={size} color={color} />
					},
					tabBarActiveTintColor: Colors.$iconPrimary,
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
					{() => Fallback || <DiaryScreen />}
				</Tab.Screen>

				<Tab.Screen
					name={LANG['s_totals']}
					// Show header when component's custom header is not rendered
					options={{ headerShown: !!Fallback }}
				>
					{() => Fallback || <TotalsNavigation />}
				</Tab.Screen>

				<Tab.Screen name={LANG['s_settings']}>
					{() => {
						const Render = gestureHandlerRootHOC(SettingsScreen)
						return <Render />
					}}
				</Tab.Screen>

				{API.session && (
					<Tab.Screen name={LANG['s_log_out']}>
						{() => <LogoutScreen />}
					</Tab.Screen>
				)}
			</Tab.Navigator>
		</NavigationContainer>
	)
})
