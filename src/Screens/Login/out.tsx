import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import Header from '../../Components/Header'
import { API } from '../../NetSchool/api'
import { LANG } from '../../Setup/constants'
import { Theme } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'

function logout() {
	runInAction(() => {
		API.logOut()
	})
}

export default observer(function LogoutScreen() {
	return (
		<View style={{ flex: 1, backgroundColor: Theme.colors.background }}>
			<Header title="Выход"></Header>
			<View style={{ alignContent: 'center', padding: Spacings.s3 }}>
				<Button
					onPress={logout}
					style={{
						backgroundColor: Theme.colors.errorContainer,
					}}
					labelStyle={{
						fontSize: 16,
						color: Theme.colors.onErrorContainer,
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
