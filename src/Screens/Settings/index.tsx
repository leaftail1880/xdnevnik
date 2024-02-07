import { observer } from 'mobx-react-lite'
import { Theme } from '../../Stores/Theme.store'
import About from './Groups/About'
import Appearance from './Groups/Appearance'
import { MainSettings } from './Groups/Main'
import PrivacyPolicy from './Groups/Policy/PrivacyPolicy'
import TermsAndConditions from './Groups/Policy/TermsAndConditions'
import { UpdatesScreen } from './Groups/Update/Update'
import { SETTINGS_ROUTES, SettingsNavigation } from './SettingsNavigation'

export const SettingsScreen = observer(function SettingsScreen() {
	Theme.key
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
		</SettingsNavigation.Navigator>
	)
})
