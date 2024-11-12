import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import Header from '~components/Header'
import { Theme } from '~models/theme'
import { API } from '~services/net-school/api'
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
			<View style={styles.container}>
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
					Выйти
				</Button>
				<Text style={styles.subtitle}>
					Если вы выйдете, то ваши логин и пароль будут удалены, и вы не сможете
					входить автоматически. Также, вы не сможете получать уведомления.
				</Text>
			</View>
		</View>
	)
})

const styles = StyleSheet.create({
	subtitle: { alignSelf: 'center', marginTop: Spacings.s2 },
	container: { alignContent: 'center', padding: Spacings.s3 },
})
