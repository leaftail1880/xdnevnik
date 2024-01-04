import {
	BottomTabBar,
	createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'
import {
	NavigationContainer,
	NavigationContainerRef,
} from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler'
import { Colors } from 'react-native-ui-lib'
import { LANG, logger } from './src/constants'

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

if (__DEV__) {
	// @ts-expect-error We support this
	import('./ReactotronConfig').then(() => logger.debug('Reactotron Configured'))
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
	const students = StudentsStore.withoutParams()
	const navigation = useRef<NavigationContainerRef<ParamListBase>>(null)
	const Fallback =
		(!API.session && <Loading text="Авторизация{dots}" />) || students.fallback

	const card = Theme.theme.colors.card
	logger.debug('card', card)

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
							[LANG['s_homework']]: 'document',
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
