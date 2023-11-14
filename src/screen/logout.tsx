import AsyncStorage from '@react-native-async-storage/async-storage'
import { useContext } from 'react'
import { View } from 'react-native'
import { API } from '../NetSchool/api'
import { Button } from '../components/button'
import { Text } from '../components/text'
import { LANG, RED_ACCENT_COLOR, styles } from '../constants'
import { CTX } from '../hooks/settings'

export function LogoutScreen() {
	const ctx = useContext(CTX)

	async function logout() {
		ctx.setStatus(undefined)
		await AsyncStorage.removeItem('session')
		await AsyncStorage.removeItem('endpoint')
		await AsyncStorage.removeItem('cache')
		API.logOut()
	}

	return (
		<View style={styles.container}>
			<Button
				style={{ ...styles.button, backgroundColor: RED_ACCENT_COLOR }}
				onPress={logout}
			>
				<Text style={styles.buttonText}>{LANG['log_out']}</Text>
			</Button>
			<Text style={{ maxWidth: 300, textAlign: 'center' }}>
				{LANG['log_out_info']}
			</Text>
		</View>
	)
}
