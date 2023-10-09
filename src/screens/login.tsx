import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import 'react-native-gesture-handler'
import { URL } from 'react-native-url-polyfill'
import WebView from 'react-native-webview'
import NetSchoolApi, { API, Endpoint } from '../NetSchool/api'
import { ROUTES } from '../NetSchool/routes'
import { Loading } from '../components/loading'
import { STYLES } from '../constants'

export const LoginScreen = ({
	loggingIn,
	setLoggingIn,
}: {
	loggingIn: boolean
	setLoggingIn(v: boolean): void
}) => {
	const [endpoints, setEndpoints] = useState<Endpoint[]>([])
	useEffect(() => {
		NetSchoolApi.getEndpoints().then(setEndpoints)
	}, [])

	const [regionName, setRegionName] = useState('')

	if (loggingIn || !endpoints) {
		const text = (loggingIn ? 'Вход' : 'Загрузка списка регионов') + '{dots}'

		return (
			<View style={STYLES.container}>
				<Text style={{ fontSize: 15 }}>
					<Loading text={text} />
				</Text>
			</View>
		)
	}

	if (!regionName)
		return (
			<View style={STYLES.container}>
				<ScrollView style={{ margin: 0, padding: 0, minWidth: 350 }}>
					{endpoints.map((endpoint, index) => (
						<Pressable
							style={{ ...STYLES.button, margin: 5, padding: 15 }}
							key={index.toString()}
							onPress={() => {
								setRegionName(endpoint.name)
								API.setEndpoint(endpoint.url)
								AsyncStorage.setItem('endpoint', endpoint.url)
							}}
						>
							<Text style={STYLES.buttonText}>{endpoint.name}</Text>
						</Pressable>
					))}
				</ScrollView>
			</View>
		)

	return (
		<WebView
			source={{
				uri: NetSchoolApi.getOrigin(API) + ROUTES.login,
			}}
			originWhitelist={['https://*', `${ROUTES.mobileAppProtocol}*`]}
			onShouldStartLoadWithRequest={event => {
				if (event.url.startsWith(ROUTES.mobileAppProtocol)) {
					console.log('Catched app url')
					const pincode = new URL(event.url).searchParams.get('pincode')
					API.getToken(ROUTES.getTokenTemplate(pincode))
						.then(async session => {
							await AsyncStorage.setItem('session', JSON.stringify(session))
							Alert.alert('Успешно!', 'Вы авторизовались.')
						})
						.catch(e => {
							console.error(e)
							Alert.alert('Не удалось получить токен авторизации', e)
						})
						.finally(() => setLoggingIn(false))
					setLoggingIn(true)
					return false
				}

				return true
			}}
		></WebView>
	)
}
