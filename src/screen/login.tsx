import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import 'react-native-gesture-handler'
import { URL } from 'react-native-url-polyfill'
import WebView from 'react-native-webview'
import { API, NetSchoolApi } from '../NetSchool/api'
import { ROUTES } from '../NetSchool/routes'
import { Button } from '../components/button'
import { Loading } from '../components/loading'
import { STYLES } from '../constants'
import { useAsync } from '../hooks/async'
import { logout } from './logout'

export function LoginScreen() {
	const [loggingIn, setLoggingIn] = useState(false)
	const [endpoints, EndpointsFallback] = useAsync(
		() => NetSchoolApi.fetchEndpoints(),
		'списка регионов'
	)
	const [regionName, setRegionName] = useState('')

	useEffect(() => {
		if (!API.loggedIn) {
			;(async function restoreSessionEffect() {
				const loadedEndpoint = await AsyncStorage.getItem('endpoint')
				const loadedSession = await AsyncStorage.getItem('session')
				if (loadedSession && loadedEndpoint) {
					API.setEndpoint(loadedEndpoint)
					API.restoreSessionFromMemory(JSON.parse(loadedSession))
				}
			})().catch(error => {
				console.error('RESTORE SESSION EFFECT ERROR', error)
			})
		}
	}, [])

	if (loggingIn) return <Loading text="Вход{dots}" />
	if (EndpointsFallback) return EndpointsFallback

	if (!regionName)
		return (
			<View style={STYLES.container}>
				<ScrollView style={{ margin: 0, padding: 0, minWidth: 350 }}>
					{endpoints.map((endpoint, index) => (
						<Button
							style={{
								...STYLES.button,
								margin: 5,
								padding: 15,
							}}
							key={index.toString()}
							onPress={() => {
								setRegionName(endpoint.name)
								API.setEndpoint(endpoint.url)
								AsyncStorage.setItem('endpoint', endpoint.url)
							}}
						>
							<Text style={STYLES.buttonText}>{endpoint.name}</Text>
						</Button>
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
					if (pincode) {
						;(async () => {
							setLoggingIn(true)
							try {
								const session = await API.getToken(
									ROUTES.getTokenTemplate(pincode)
								)
								await AsyncStorage.setItem('session', JSON.stringify(session))
								Alert.alert('Успешно!', 'Вы авторизовались.')
							} catch (e) {
								console.error(e)
								Alert.alert('Не удалось получить токен авторизации', e)
							} finally {
								setLoggingIn(false)
							}
						})()
						return false
					} else {
						Alert.alert(
							'Код не получен!',
							'Скорее всего, электронный дневник обновился, а XDnevnik еще нет'
						)
						return false
					}
				}

				return true
			}}
		></WebView>
	)
}

setInterval(() => {
	console.log('refresh token check')
	try {
		API.refreshTokenIfExpired()
	} catch (error) {
		Alert.alert('Не удалось получить новый токен', error.message, [
			{ text: 'Попробовать позже' },
			{
				text: 'Выйти и зайти нормально',
				onPress: logout,
			},
		])
	}
}, 1000 * 60 * 5)