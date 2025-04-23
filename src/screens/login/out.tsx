import Header from '@/components/Header'
import { Theme } from '@/models/theme'
import { API } from '@/services/net-school/api'
import { ModalAlert } from '@/utils/Toast'
import { useStyles } from '@/utils/useStyles'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { Spacings } from '../../utils/Spacings'

function logOut() {
	ModalAlert.close()
	runInAction(() => API.logOut())
}

function ensureLogin() {
	ModalAlert.show(
		'Вы уверены?',
		<Text>
			Если вы выйдете, то ваши логин и пароль будут удалены, и вы не сможете
			входить автоматически. Также, вы не сможете получать уведомления.
		</Text>,
		true,
		[{ label: 'Выйти', callback: logOut }],
	)
}

export const LogoutButton = observer(function LogoutButton() {
	return (
		<Button onPress={ensureLogin} {...Theme.destructiveButton}>
			Выйти
		</Button>
	)
})

export default observer(function LogoutScreen() {
	const viewStyle = useStyles(() => ({
		flex: 1,
		backgroundColor: Theme.colors.background,
	}))

	return (
		<View style={viewStyle}>
			<Header title="Выход"></Header>
			<View style={styles.container}>
				<LogoutButton />
			</View>
		</View>
	)
})

const styles = StyleSheet.create({
	subtitle: { alignSelf: 'center', marginTop: Spacings.s2 },
	container: { alignContent: 'center', padding: Spacings.s3 },
})
