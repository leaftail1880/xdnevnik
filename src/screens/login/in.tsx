import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'
import { BackHandler, RefreshControl, ScrollView, View } from 'react-native'
import { Appbar, Button } from 'react-native-paper'
import WebView from 'react-native-webview'
import Header from '~components/Header'
import Loading from '~components/Loading'
import { AsyncStore } from '~models/async.store'
import { Theme } from '~models/theme'
import { API, NetSchoolApi } from '~services/net-school/api'
import { ROUTES } from '~services/net-school/routes'
import { Logger } from '../../constants'
import { Spacings } from '../../utils/Spacings'
import { Toast } from '../../utils/Toast'

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
	() => [LoginStore.loading],
)

export default observer(function LoginScreen() {
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

	if (loggingIn) return <Loading text="Авторизация..." />
	if (EndpointsStore.fallback) return EndpointsStore.fallback

	if (!regionName)
		return (
			<ScrollView
				style={{ margin: 0, padding: 0, minWidth: 350, flex: 1 }}
				refreshControl={EndpointsStore.refreshControl}
			>
				{EndpointsStore.result!.slice()
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
								} catch (e) {
									Logger.error(e)
									Toast.show({
										title: 'Не удалось получить токен авторизации',
										body: e + '',
										error: true,
									})
								} finally {
									runInAction(() => (LoginStore.loggingIn = false))
								}
							})()
							return false
						} else {
							Toast.show({
								title: 'Код не получен!',
								body: 'Такое иногда происходит в конце четвертей, когда журнал перегружен. Попробуйте снова',
								error: true,
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
