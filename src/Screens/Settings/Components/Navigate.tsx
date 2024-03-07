import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { Divider, List } from 'react-native-paper'
import { Theme } from '../../../Stores/Theme'
import { SETTINGS_ROUTES, SettingsRoutes } from '../navigation'

export const SettingsJumpNavigation = observer(
	function SettingsJumpNavigation(props: {
		target: keyof typeof SETTINGS_ROUTES
		navigation: StackScreenProps<SettingsRoutes>
	}) {
		return (
			<>
				<List.Item
					onPress={() => props.navigation.navigation.navigate(props.target)}
					title={SETTINGS_ROUTES[props.target]}
					titleStyle={Theme.fonts.titleMedium}
					right={props => <List.Icon {...props} icon="arrow-right" />}
				/>
				<Divider />
			</>
		)
	}
)
