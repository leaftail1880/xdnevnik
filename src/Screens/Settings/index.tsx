import About from './Groups/About'
import Appearance from './Groups/Appearance'
import { MainSettings } from './Groups/Main'
import { Notifications } from './Groups/Notifications'
import PrivacyPolicy from './Groups/Policy/PrivacyPolicy'
import TermsAndConditions from './Groups/Policy/TermsAndConditions'
import { UpdatesScreen } from './Groups/Update/Update'
import { SETTINGS_ROUTES, SettingsNavigation } from './SettingsNavigation'

// eslint-disable-next-line mobx/missing-observer
export const SettingsScreen = function SettingsScreen() {
	return (
		<SettingsNavigation.Navigator
			initialRouteName="main"
			screenOptions={a => {
				return { title: SETTINGS_ROUTES[a.route.name] }
			}}
		>
			<SettingsNavigation.Screen name="main" component={MainSettings} />
			<SettingsNavigation.Screen name="update" component={UpdatesScreen} />
			<SettingsNavigation.Screen name="privacy" component={PrivacyPolicy} />
			<SettingsNavigation.Screen name="terms" component={TermsAndConditions} />
			<SettingsNavigation.Screen name="colors" component={Appearance} />
			<SettingsNavigation.Screen name="about" component={About} />
			<SettingsNavigation.Screen name="notifs" component={Notifications} />
		</SettingsNavigation.Navigator>
	)
}
