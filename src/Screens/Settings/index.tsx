import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import Loading from '../../Components/Loading'
import { API } from '../../NetSchool/api'
import { Settings } from '../../Stores/Settings'
import { Theme } from '../../Stores/Theme'
import { SettingsJumpNavigation } from './Components/Navigate'

import About from './About'
import Advanced from './Advanced'
import Appearance from './Appearance'
import Notifications from './Notifications'
import PrivacyPolicy from './Policy/PrivacyPolicy'
import TermsAndConditions from './Policy/TermsAndConditions'
import UpdatesScreen from './Update'

import SelectModal from '../../Components/SelectModal'
import { StudentsStore } from '../../Stores/NetSchool'
import {
	SETTINGS_ROUTES,
	SettingsNavigation,
	SettingsRoutes,
} from './navigation'

export default observer(function SettingsScreen() {
	Theme.key
	return (
		<SettingsNavigation.Navigator
			initialRouteName="main"
			screenOptions={a => {
				return { title: SETTINGS_ROUTES[a.route.name] }
			}}
		>
			<SettingsNavigation.Screen name="main" component={MainSettings} />

			<SettingsNavigation.Screen name="notifs" component={Notifications} />
			<SettingsNavigation.Screen name="colors" component={Appearance} />
			<SettingsNavigation.Screen name="update" component={UpdatesScreen} />
			<SettingsNavigation.Screen name="advanced" component={Advanced} />
			<SettingsNavigation.Screen name="about" component={About} />

			<SettingsNavigation.Screen name="privacy" component={PrivacyPolicy} />
			<SettingsNavigation.Screen name="terms" component={TermsAndConditions} />
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
			<SelectStudent />
			<SettingsJumpNavigation navigation={props} target={'notifs'} />
			<SettingsJumpNavigation navigation={props} target={'colors'} />
			<SettingsJumpNavigation navigation={props} target={'update'} />
			<SettingsJumpNavigation navigation={props} target={'advanced'} />
			<SettingsJumpNavigation navigation={props} target={'about'} />
		</ScrollView>
	)
})

const SelectStudent = observer(function SelectStudent() {
	return API.session ? (
		StudentsStore.fallback || (
			<SelectModal
				data={StudentsStore.result.map((student, index) => ({
					value: index + '',
					label: Settings.fullname(student.name),
				}))}
				mode="list.item"
				value={Settings.studentIndex + ''}
				onSelect={student =>
					Settings.save({ studentIndex: Number(student.value) })
				}
				label={'Ученик'}
			/>
		)
	) : (
		<Loading text="Ожидание авторизации{dots}"></Loading>
	)
})