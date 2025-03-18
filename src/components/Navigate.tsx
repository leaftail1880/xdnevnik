import { Theme } from '@/models/theme'
import { SETTINGS_ROUTES, SettingsRoutes } from '@/screens/settings/navigation'
import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { Divider, List } from 'react-native-paper'

export const SettingsJumpNavigation = observer(
	function SettingsJumpNavigation(props: {
		target: keyof typeof SETTINGS_ROUTES
		description: string
		navigation: StackScreenProps<SettingsRoutes>
	}) {
		return (
			<>
				<List.Item
					onPress={() => props.navigation.navigation.navigate(props.target)}
					title={SETTINGS_ROUTES[props.target]}
					titleStyle={Theme.fonts.titleMedium}
					description={props.description}
					right={props => <List.Icon {...props} icon="arrow-right" />}
				/>
				<Divider />
			</>
		)
	},
)
