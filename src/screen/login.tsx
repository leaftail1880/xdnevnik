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
import { LOGGER, styles } from '../constants'
import { useAPI } from '../hooks/api'

export function LoginScreen() {
	const [loggingIn, setLoggingIn] = useState(false)
	const { result: endpoints, fallback: EndpointsFallback } = useAPI(
		NetSchoolApi,
		'fetchEndpoints',
		undefined,
		'списка регионов',
		[]
	)
	const [regionName, setRegionName] = useState('')

	useEffect(() => {
		if (!API.session) {
			;(async function restoreSessionEffect() {
				const loadedEndpoint = await AsyncStorage.getItem('endpoint')
				const loadedSession = await AsyncStorage.getItem('session')
				if (loadedSession && loadedEndpoint) {
					API.setEndpoint(loadedEndpoint)
					API.restoreSessionFromMemory(JSON.parse(loadedSession))
				}
			})()
		}
	})

	useEffect(() => {
		LOGGER.debug(
			'Logging: ' + !loggingIn && !API.authorized && API.session + ''
		)
		if (!loggingIn && !API.authorized && API.session) {
			API.refreshTokenIfExpired(error => {
				LOGGER.error('RESTORE SESSION EFFECT ERROR', error)
			})
		}
	})

	if (loggingIn) return <Loading text="Вход{dots}" />
	if (EndpointsFallback) return EndpointsFallback

	if (!regionName)
		return (
			<View style={styles.container}>
				<ScrollView style={{ margin: 0, padding: 0, minWidth: 350 }}>
					{endpoints.map((endpoint, index) => (
						<Button
							style={{
								...styles.button,
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
							<Text style={styles.buttonText}>{endpoint.name}</Text>
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
								LOGGER.error(e)
								Alert.alert('Не удалось получить токен авторизации', e)
							} finally {
								setLoggingIn(false)
							}
						})()
						return false
					} else {
						Alert.alert(
							'Код не получен!',
							'Попробуйте закрыть приложение и войти снова. Такое иногда происходит в конце четвертей когда журнал перегружен.'
						)
						return false
					}
				}

				return true
			}}
		></WebView>
	)
}

// let skip = 0
// setInterval(() => {
// 	if (skip) {
// 		skip--
// 		return
// 	}
// 	API.refreshTokenIfExpired(
// 		error => (
// 			(skip = 9999999),
// 			Alert.alert('Не удалось обновить токен', error.message, [
// 				{ text: 'Попробовать через 10 минут', onPress: () => (skip = 10) },
// 				{
// 					text: 'Выйти и зайти нормально',
// 					onPress: logout,
// 				},
// 			])
// 		)
// 	)
// }, 1000 * 60)
