import { Colors, Text } from 'react-native-ui-lib'
import View from 'react-native-ui-lib/view'
import { Button } from '../../Components/Button'
import { API } from '../../NetSchool/api'
import { LANG } from '../../Setup/constants'
import { XDnevnik } from '../../Stores/Xdnevnik.store'

// eslint-disable-next-line mobx/missing-observer
export const LogoutScreen = function LogoutScreen() {
	async function logout() {
		XDnevnik.status = undefined
		API.logOut()
	}

	return (
		<View flex center>
			<Button
				onPress={logout}
				style={{
					backgroundColor: Colors.$backgroundDangerHeavy,
					minWidth: 250,
					minHeight: 50,
				}}
			>
				<Text $textAccent>{LANG['log_out']}</Text>
			</Button>
			<Text center style={{ maxWidth: 300 }}>
				{LANG['log_out_info']}
			</Text>
		</View>
	)
}
