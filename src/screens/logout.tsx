import AsyncStorage from '@react-native-async-storage/async-storage'
import { Pressable, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { LANG, RED_ACCENT_COLOR, STYLES } from '../constants'

export const LogoutScreen = () => {
	const logout = async () => {
		await AsyncStorage.removeItem('session')
		await AsyncStorage.removeItem('endpoint')
		await AsyncStorage.removeItem('cache')
		API.logOut()
	}
	return (
		<View style={STYLES.container}>
			<Pressable
				style={{ ...STYLES.button, backgroundColor: RED_ACCENT_COLOR }}
				onPress={logout}
			>
				<Text style={STYLES.buttonText}>{LANG['log_out']}</Text>
			</Pressable>
			<Text style={{ maxWidth: 300, textAlign: 'center' }}>
				{LANG['log_out_info']}
			</Text>
		</View>
	)
}
