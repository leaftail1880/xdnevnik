import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { Button } from 'react-native-paper'
import { styles } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme'
import { SETTINGS_ROUTES, SettingsRoutes } from '../SettingsNavigation'

export const SettingsJumpNavigation = observer(
	function SettingsJumpNavigation(props: {
		target: keyof typeof SETTINGS_ROUTES
		navigation: StackScreenProps<SettingsRoutes>
	}) {
		Theme.key
		return (
			<Button
				onPress={() => props.navigation.navigation.navigate(props.target)}
				icon={'arrow-right'}
				contentStyle={[
					styles.stretch,
					{ padding: 0, flexDirection: 'row-reverse' },
				]}
				labelStyle={Theme.fonts.titleMedium}
			>
				{SETTINGS_ROUTES[props.target]}
			</Button>
		)
	}
)
