import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { Theme } from '../../../Stores/Theme.store'
import { SETTINGS_ROUTES, SettingsRoutes } from '../SettingsNavigation'
import { SettingsText } from './Base'
import { SettingsButton } from './SettingsButton'

export const SettingsJumpNavigation = observer(
	function SettingsJumpNavigation(props: {
		target: keyof typeof SETTINGS_ROUTES
		navigation: StackScreenProps<SettingsRoutes>
	}) {
		Theme.key
		return (
			<SettingsButton
				onPress={() => props.navigation.navigation.navigate(props.target)}
			>
				<SettingsText>{'' || SETTINGS_ROUTES[props.target]}</SettingsText>
			</SettingsButton>
		)
	}
)
