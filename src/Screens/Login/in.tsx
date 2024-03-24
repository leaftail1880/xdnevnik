import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { BackHandler, RefreshControl, ScrollView, View } from 'react-native'
import { Appbar, Button } from 'react-native-paper'
import Toast from 'react-native-toast-message'
import WebView from 'react-native-webview'
import Header from '../../Components/Header'
import Loading from '../../Components/Loading'
import { API, NetSchoolApi } from '../../NetSchool/api'
import { ROUTES } from '../../NetSchool/routes'
import { Logger } from '../../Setup/constants'
import { AsyncStore } from '../../Stores/Async'
import { Theme } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'

const LoginStore = new (class {
	constructor() {
		makeAutoObservable(this)
		setTimeout(() => runInAction(() => (this.loading = 'loaded')), 1000)
	}

	loggingIn = false
	regionName = ''

	loading: 'loaded' | undefined = undefined
})()

const EndpointsStore = new AsyncStore(
	NetSchoolApi,
	'fetchEndpoints',
	'списка регионов',
	{},
	// It will not do request to region list on each app
	// startup for the first second while app is loading
	() => [LoginStore.loading]
)

export default observer(function LoginScreen() {
	Theme.key
	
	return (
		<View
			style={{
				height: '100%',
			}}
		>
			<Header title="Вход">
				{LoginStore.regionName && (
					<Appbar.BackAction
						onPress={() => runInAction(() => (LoginStore.regionName = ''))}
					/>
				)}
			</Header>

			<LoginScreenContent />
			<View style={{ margin: Spacings.s2 }}></View>
		</View>
	)
})

export const LoginScreenContent = observer(function LoginScreenContent() {
	const { loggingIn, regionName } = LoginStore
	const endpoints = EndpointsStore as unknown as ReturnType<
		(typeof EndpointsStore)['state']
	>
	const webviewRef = useRef<WebView>(null)

	useEffect(() => {
		const goBack = () => {
			if (!webviewRef.current) return
			webviewRef.current.goBack()
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
			<ScrollView
				style={{ margin: 0, padding: 0, minWidth: 350, flex: 1 }}
				refreshControl={endpoints.refreshControl}
			>
				{endpoints.result
					.slice()
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((endpoint, index) => (
						<Button
							key={index.toString()}
							onPress={() => {
								runInAction(() => {
									API.setEndpoint(endpoint.url)
									LoginStore.regionName = endpoint.name
								})
							}}
							labelStyle={{
								textAlign: 'left',
								alignSelf: 'flex-start',
								fontSize: 16,
							}}
							style={{
								backgroundColor: Theme.colors.elevation.level1,
								margin: Spacings.s1,
							}}
						>
							{endpoint.name}
						</Button>
					))}
			</ScrollView>
		)

	const onWebviewRefresh = () => {
		webviewRef.current?.reload()
	}

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

									Toast.show({ text1: 'Успешная авторизация!' })
								} catch (e) {
									Logger.error(e)
									Toast.show({
										text1: 'Не удалось получить токен авторизации',
										text2: e + '',
										type: 'error',
									})
								} finally {
									runInAction(() => (LoginStore.loggingIn = false))
								}
							})()
							return false
						} else {
							Toast.show({
								text1: 'Код не получен!',
								text2:
									'Такое иногда происходит в конце четвертей, когда журнал перегружен. Попробуйте снова',
								type: 'error',
							})
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
