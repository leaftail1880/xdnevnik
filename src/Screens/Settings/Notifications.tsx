import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { List } from 'react-native-paper'
import { Theme } from '../../Stores/Theme'
import { SwitchSetting } from './Components/SwitchSetting'
import { SettingsRoutes } from './navigation'

export default observer(function Notifications(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	props: StackScreenProps<SettingsRoutes>
) {
	Theme.key
	return (
		<ScrollView>
			<List.Section title="Общие">
				<SwitchSetting
					label={'Уведомления об уроках'}
					setting="lessonNotifications"
				/>

				{
					// Bugged
				}
				{/* <SwitchSetting
					label={'Уведомления об оценках'}
					setting="marksNotifications"
				/> */}
			</List.Section>
		</ScrollView>
	)
})
