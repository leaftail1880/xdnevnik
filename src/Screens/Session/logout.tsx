import { observer } from 'mobx-react-lite'
import { Colors, Text } from 'react-native-ui-lib'
import View from 'react-native-ui-lib/view'
import { Button } from '../../Components/Button'
import { Header } from '../../Components/Header'
import { API } from '../../NetSchool/api'
import { LANG } from '../../Setup/constants'
import { Theme } from '../../Stores/Theme.store'
import { XDnevnik } from '../../Stores/Xdnevnik.store'

export const LogoutScreen = observer(function LogoutScreen() {
	async function logout() {
		XDnevnik.status = undefined
		API.logOut()
	}

	Theme.key

	return (
		<View flex>
			<Header title="Выход"></Header>
			<View center>
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
		</View>
	)
})
