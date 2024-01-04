import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Colors, Text } from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import { AUTOLOGIN } from '../Screens/Session/autologin'
import { Theme } from '../Stores/Theme.store'
import { XDnevnik } from '../Stores/Xdnevnik.store'
import { styles } from '../constants'
import { IconButton } from './Button'

export const StatusBadge = observer(function StatusBadge() {
	if (!XDnevnik.status) return false

	const reset = () => {
		AUTOLOGIN.requestSent = false
		API.reload++
	}
	const color = XDnevnik.status.error ? Colors.$textAccent : Colors.$textDefault
	return (
		<View
			style={[
				styles.stretch,
				{
					elevation: 3,
					minHeight: 40,
					backgroundColor: XDnevnik.status.error
						? Colors.$backgroundDangerHeavy
						: Theme.theme.colors.card,
				},
			]}
		>
			<Text style={{ fontSize: 15, color }}>{XDnevnik.status.content}</Text>
			{XDnevnik.status.error && (
				<IconButton onPress={reset} icon="reload" iconColor={color} size={18} />
			)}
		</View>
	)
})
