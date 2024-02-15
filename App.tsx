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
import { createMaterialBottomTabNavigator } from 'react-native-paper/react-navigation'
import { Colors, LoaderScreen } from 'react-native-ui-lib'
import { Ionicon } from './src/Components/Icon'
import { Loading } from './src/Components/Loading'
// import { StatusBadge } from './src/Components/StatusBadge'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { API } from './src/NetSchool/api'
import { DiaryScreen } from './src/Screens/Diary'
import { LoginScreen } from './src/Screens/Session/login'
import { LogoutScreen } from './src/Screens/Session/logout'
import { SettingsScreen } from './src/Screens/Settings/index'
import { TotalsNavigation } from './src/Screens/Totals'
import './src/Setup/notifications'
import { SENTRY_ROUTING } from './src/Setup/sentry'
import { StudentsStore } from './src/Stores/API.stores'
import { Theme } from './src/Stores/Theme.store'

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

		if (!Theme.loaded) return <LoaderScreen />

		// Rerender on accent color change
		// idk why its not subscribing to it be default
		Theme.accentColor

		const students = StudentsStore

		let Fallback
		if (!API.session) {
			// eslint-disable-next-line mobx/missing-observer
			Fallback = function Fallback() {
				return <Loading text="Авторизация{dots}" />
			}
		} else if (students.fallback) Fallback = () => students.fallback

		return (
			<SafeAreaProvider>
				<StatusBar
					translucent={true}
					style={Theme.scheme === 'dark' ? 'light' : 'dark'}
				/>
				<StatusBar />
				<NavigationContainer
					theme={toJS(Theme.theme)}
					ref={navigation}
					onReady={() => {
						SENTRY_ROUTING.registerNavigationContainer(navigation)
					}}
				>
					<Tab.Navigator
						// tabBar={props => (
						// 	<View>
						// 		<StatusBadge />
						// 		<MaterialBottomTabView {...props} />
						// 	</View>
						// )}

						sceneAnimationEnabled={true}
						sceneAnimationType={'shifting'}
						activeColor={Colors.$iconPrimaryLight}
						inactiveColor={Theme.accentColor}
						// labeled={false}
						barStyle={{
							backgroundColor: Colors.$backgroundPrimaryMedium,
							height: '8%',
							padding: 0,
							margin: 0,
							alignContent: 'center',
							alignItems: 'center',
							justifyContent: 'center',
						}}
						activeIndicatorStyle={{
							backgroundColor: Colors.$backgroundPrimaryHeavy,
							height: '120%',
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
							tabBarActiveTintColor: Colors.$iconPrimary,
							tabBarInactiveTintColor: Colors.$iconDefault,
							tabBarHideOnKeyboard: true,
						})}
					>
						{!API.session && (
							<Tab.Screen name={LANG['s_log_in']} component={LoginScreen} />
						)}

						<Tab.Screen
							name={LANG['s_diary']}
							component={Fallback || DiaryScreen}
						/>

						<Tab.Screen
							name={LANG['s_totals']}
							// Show header when component's custom header is not rendered
							// options={{ headerShown: !!Fallback }}
							component={Fallback || TotalsNavigation}
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
			</SafeAreaProvider>
		)
	})
)
