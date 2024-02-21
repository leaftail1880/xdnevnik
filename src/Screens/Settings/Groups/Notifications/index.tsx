import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { Theme } from '../../../../Stores/Theme'
import { SwitchSetting } from '../../Components/SwitchSetting'
import { SettingsRoutes } from '../../SettingsNavigation'

export const Notifications = observer(function Notifications(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	props: StackScreenProps<SettingsRoutes>
) {
	Theme.key
	return (
		<ScrollView>
			<SwitchSetting
				label={'Уведомления об уроках'}
				setting="lessonNotifications"
			/>
			<SwitchSetting
				label={'Уведомления об оценках'}
				setting="marksNotifications"
			/>
		</ScrollView>
	)
})
