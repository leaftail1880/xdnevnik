import AsyncStorage from '@react-native-async-storage/async-storage'
import { useContext } from 'react'
import { Colors, Text } from 'react-native-ui-lib'
import View from 'react-native-ui-lib/view'
import { API } from '../NetSchool/api'
import { Button } from '../components/Button'
import { LANG } from '../constants'
import { Ctx } from '../hooks/settings'

export function LogoutScreen() {
	const ctx = useContext(Ctx)

	async function logout() {
		ctx.setStatus(undefined)
		await AsyncStorage.removeItem('session')
		await AsyncStorage.removeItem('endpoint')
		await AsyncStorage.removeItem('cache')
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
