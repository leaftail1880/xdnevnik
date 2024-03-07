import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { Header } from '../../Components/Header'
import { Spacings } from '../../Components/Spacings'
import { API } from '../../NetSchool/api'
import { LANG } from '../../Setup/constants'
import { Theme } from '../../Stores/Theme'

export const LogoutScreen = observer(function LogoutScreen() {
	function logout() {
		runInAction(() => {
			API.logOut()
		})
	}

	return (
		<View style={{ flex: 1 }}>
			<Header title="Выход"></Header>
			<View style={{ alignContent: 'center', padding: Spacings.s3 }}>
				<Button
					onPress={logout}
					style={{
						backgroundColor: Theme.colors.error,
					}}
					labelStyle={{
						fontSize: 16,
						color: Theme.colors.onError,
					}}
				>
					{LANG['log_out']}
				</Button>
				<Text style={{ alignSelf: 'center', marginTop: Spacings.s2 }}>
					{LANG['log_out_info']}
				</Text>
			</View>
		</View>
	)
})