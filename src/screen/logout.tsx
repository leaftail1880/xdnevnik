import AsyncStorage from '@react-native-async-storage/async-storage'
import { Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { Button } from '../components/button'
import { LANG, RED_ACCENT_COLOR, STYLES } from '../constants'

export function LogoutScreen() {
	return (
		<View style={STYLES.container}>
			<Button
				style={{ ...STYLES.button, backgroundColor: RED_ACCENT_COLOR }}
				onPress={logout}
			>
				<Text style={STYLES.buttonText}>{LANG['log_out']}</Text>
			</Button>
			<Text style={{ maxWidth: 300, textAlign: 'center' }}>
				{LANG['log_out_info']}
			</Text>
		</View>
	)
}

export async function logout() {
	await AsyncStorage.removeItem('session')
	await AsyncStorage.removeItem('endpoint')
	await AsyncStorage.removeItem('cache')
	API.logOut()
}
