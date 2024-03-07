import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { Loading } from '../../Components/Loading'
import { API } from '../../NetSchool/api'
import { StudentsStore } from '../../Stores/API'
import { Settings } from '../../Stores/Settings'
import { Theme } from '../../Stores/Theme'
import { DropdownSettingsButton } from './Components/DropdownSettingsButton'
import { SettingsJumpNavigation } from './Components/Navigate'

import About from './About'
import Appearance from './Appearance'
import Notifications from './Notifications'
import PrivacyPolicy from './Policy/PrivacyPolicy'
import TermsAndConditions from './Policy/TermsAndConditions'
import UpdatesScreen from './Update'

import {
	SETTINGS_ROUTES,
	SettingsNavigation,
	SettingsRoutes,
} from './navigation'

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

			<SettingsNavigation.Screen name="colors" component={Appearance} />

			<SettingsNavigation.Screen name="about" component={About} />
			<SettingsNavigation.Screen name="privacy" component={PrivacyPolicy} />
			<SettingsNavigation.Screen name="terms" component={TermsAndConditions} />

			<SettingsNavigation.Screen name="notifs" component={Notifications} />
		</SettingsNavigation.Navigator>
	)
})

const MainSettings = observer(function MainSettings(
	props: StackScreenProps<SettingsRoutes>
) {
	Theme.key
	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
				alignContent: 'flex-start',
				justifyContent: 'flex-start',
			}}
		>
			{API.session ? (
				StudentsStore.fallback || (
					<DropdownSettingsButton
						data={StudentsStore.result.map((student, i) => ({
							i,
							name: Settings.fullname(student.name),
						}))}
						onSelect={s => Settings.save({ studentIndex: s.i })}
						selectionText={i => i?.name}
						defaultValueByIndex={Settings.studentIndex}
						label={false}
						buttonViewStyle={{ alignItems: 'center', justifyContent: 'center' }}
					/>
				)
			) : (
				<Loading text="Ожидание авторизации{dots}"></Loading>
			)}
			<SettingsJumpNavigation navigation={props} target={'notifs'} />
			<SettingsJumpNavigation navigation={props} target={'colors'} />
			<SettingsJumpNavigation navigation={props} target={'update'} />
			<SettingsJumpNavigation navigation={props} target={'about'} />
		</ScrollView>
	)
})
