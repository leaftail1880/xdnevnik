import { observer } from 'mobx-react-lite'
import { Theme } from '../../../../Stores/Theme.store'
import { StackScreenProps } from '@react-navigation/stack'
import { SwitchSetting } from '../../Components/SwitchSetting'
import { SettingsRoutes } from '../../SettingsNavigation'

export const Notifications = observer(function Notifications(
	props: StackScreenProps<SettingsRoutes>
) {
	return (
		<SwitchSetting
			label={'Уведомления'}
			setting="notifications"
			key={Theme.key}
		/>
	)
})
