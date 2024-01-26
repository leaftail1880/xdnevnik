import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { Alert, BackHandler, RefreshControl, ScrollView } from 'react-native'
import { Text, View } from 'react-native-ui-lib'
import { URL } from 'react-native-url-polyfill'
import WebView from 'react-native-webview'
import { Button } from '../../Components/Button'
import { Loading } from '../../Components/Loading'
import { API, NetSchoolApi } from '../../NetSchool/api'
import { ROUTES } from '../../NetSchool/routes'
import { logger } from '../../Setup/constants'
import { APIStore } from '../../Stores/API.store'
import { XDnevnik } from '../../Stores/Xdnevnik.store'

const LoginStore = new (class {
	constructor() {
		makeAutoObservable(this)
		setTimeout(() => runInAction(() => (this.loading = 'loaded')), 1000)
	}

	loggingIn = false
	regionName = ''

	loading: 'loaded' | undefined = undefined
})()

const EndpointsStore = new APIStore(
	NetSchoolApi,
	'fetchEndpoints',
	'списка регионов',
	{},
	// It will not do request to region list on each app
	// startup for the first second while app is loading
	() => [LoginStore.loading]
)

export const LoginScreen = observer(function LoginScreen() {
	const { loggingIn, regionName } = LoginStore
	const endpoints = EndpointsStore as unknown as ReturnType<
		(typeof EndpointsStore)['state']
	>
	const webviewRef = useRef<WebView>(null)

	useEffect(() => {
		const goBack = () => {
			webviewRef.current?.goBack()
			return true
		}

		if (regionName) {
			BackHandler.addEventListener('hardwareBackPress', goBack)
		}

		return () => BackHandler.removeEventListener('hardwareBackPress', goBack)
	}, [regionName])

	if (loggingIn) return <Loading text="Вход{dots}" />
	if (endpoints.fallback) return endpoints.fallback

	if (!regionName)
		return (
			<View flex center>
				<ScrollView
					style={{ margin: 0, padding: 0, minWidth: 350 }}
					refreshControl={endpoints.refreshControl}
				>
					{endpoints.result
						.slice()
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((endpoint, index) => (
							<Button
								margin-s2
								br20
								bg-$backgroundAccent
								style={{
									elevation: 3,
								}}
								key={index.toString()}
								onPress={() => {
									runInAction(() => {
										API.setEndpoint(endpoint.url)
										LoginStore.regionName = endpoint.name
									})
								}}
							>
								<Text $textAccent center margin-s2>
									{endpoint.name}
								</Text>
							</Button>
						))}
				</ScrollView>
			</View>
		)

	const onWebviewRefresh = () => {
		webviewRef.current?.reload()
	}
	BackHandler.addEventListener

	return (
		<ScrollView
			refreshControl={
				<RefreshControl refreshing={false} onRefresh={onWebviewRefresh} />
			}
			contentContainerStyle={{ width: '100%', height: '100%' }}
		>
			<WebView
				source={{
					uri: NetSchoolApi.getOrigin(API) + ROUTES.login,
				}}
				originWhitelist={['https://*', `${ROUTES.mobileAppProtocol}*`]}
				ref={webviewRef}
				onShouldStartLoadWithRequest={event => {
					if (event.url.startsWith(ROUTES.mobileAppProtocol)) {
						const pincode = new URL(event.url).searchParams.get('pincode')
						if (pincode) {
							;(async () => {
								runInAction(() => (LoginStore.loggingIn = true))

								try {
									await API.getToken(ROUTES.getTokenTemplate(pincode))

									runInAction(() => {
										XDnevnik.status = {
											content: 'Успешная авторизация!',
											error: false,
										}
									})
									setTimeout(
										() => runInAction(() => (XDnevnik.status = undefined)),
										5000
									)
								} catch (e) {
									logger.error(e)
									Alert.alert('Не удалось получить токен авторизации', e)
									runInAction(() => (LoginStore.loggingIn = true))
								} finally {
									runInAction(() => (LoginStore.loggingIn = true))
								}
							})()
							return false
						} else {
							Alert.alert(
								'Код не получен!',
								'Попробуйте войти снова. Такое иногда происходит в конце четвертей когда журнал перегружен.'
							)
							runInAction(() => (LoginStore.regionName = ''))

							return false
						}
					}

					return true
				}}
			/>
		</ScrollView>
	)
})
