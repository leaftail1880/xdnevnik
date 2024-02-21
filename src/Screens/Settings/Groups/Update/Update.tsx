import * as Device from 'expo-device'
import * as FileSystem from 'expo-file-system'
import * as IntentLauncherAndroid from 'expo-intent-launcher'
// import * as MediaLibrary from 'expo-media-library'
// import * as Permissions from 'expo-permissions'
import * as Application from 'expo-application'
import * as ExpoSharing from 'expo-sharing'
import * as Updates from 'expo-updates'
import { useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { Spacings } from '../../../../Components/Spacings'
import { getLatestGithubReleaseUrl } from '../../../../GithubUpdate/update'
import { Logger, styles } from '../../../../Setup/constants'

const openAppInstaller = async (download: typeof FileSystem.downloadAsync) => {
	try {
		if (Device.deviceType !== Device.DeviceType.PHONE || !Device.osName) {
			Alert.alert('Обновление вне телефона не поддерживается')
			return
		}

		if (Device.designName) {
			const release = await getLatestGithubReleaseUrl('XDnevnik.apk', {})
			if (!release) return
			const uri = FileSystem.cacheDirectory + 'update.apk'

			await download(release, uri)
			const cUri = await FileSystem.getContentUriAsync(uri)
			await IntentLauncherAndroid.startActivityAsync(
				'android.intent.action.INSTALL_PACKAGE',
				{
					data: cUri,
					flags: 1,
				}
			)
		} else if (['iOS', 'iPadOS'].includes(Device.osName)) {
			const release = await getLatestGithubReleaseUrl('XDnevnik.ipa', {})
			if (!release) return
			const uri = FileSystem.cacheDirectory + 'XDnevnikUpdate.ipa'

			await download(release, uri)
			await ExpoSharing.shareAsync(uri, {
				UTI: '.ipa',
				mimeType: 'application/octet-stream',
			})
			// const { status } = await Permissions.askAsync(
			// 	Permissions.MEDIA_LIBRARY_WRITE_ONLY
			// )

			// if (status === 'granted') {
			// 	const asset = await MediaLibrary.createAssetAsync(fileUri)
			// 	const external = await MediaLibrary.createAlbumAsync(
			// 		'Download',
			// 		asset,
			// 		false
			// 	)

			// 	await ExpoSharing.shareAsync(fileUri, {
			// 		UTI: '.ipa',
			// 		mimeType: 'application/octet-stream',
			// 	})
			// } else
			// 	Alert.alert(
			// 		'Дайте разрешение',
			// 		'XDnevnik всего-лишь скачает один файл в папку Downloads и откроет для Вас проводник чтобы Вы могли обновить XDnevnik и получить новейшие возможности.'
			// 	)
		}
		Logger.info('App installer opened successfully')
		return true
	} catch (error) {
		Alert.alert('Ошибка', error + '')
		Logger.error('Failed to open the app installer', error)
		return false
	}
}

// eslint-disable-next-line mobx/missing-observer
export const UpdatesButton = function UpdatesButton() {
	const [progress, setProgress] = useState<string | undefined>()
	return (
		<Button
			onPress={async () => {
				try {
					setProgress('Получение списка версий...')
					const result = await openAppInstaller(async (uri, fileUri) => {
						const downloader = FileSystem.createDownloadResumable(
							uri,
							fileUri,
							{},
							p => {
								setProgress(
									'Скачивание: ' +
										(
											(p.totalBytesWritten / p.totalBytesExpectedToWrite) *
											100
										).toFixed(2) +
										'%'
								)
							}
						)

						const result = await downloader.downloadAsync()
						if (!result) {
							Alert.alert('Не удалось сохранить обновление')
							setProgress(void 0)
							throw new Error('Failed to download update')
						}
						return result
					})

					if (typeof result === 'undefined') {
						setProgress(void 0)
					} else setProgress('Обновление скачано')
				} catch (error) {
					Alert.alert(`Не удалось получить обновление`, '' + error)
					setProgress(void 0)
				}
			}}
		>
			{progress ?? 'Проверить обновления'}
		</Button>
	)
}

// eslint-disable-next-line mobx/missing-observer
export const UpdatesScreen = function UpdatesScreen() {
	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
				alignContent: 'flex-start',
				justifyContent: 'flex-start',
			}}
		>
			<UpdatesButton />

			<View
				style={[styles.stretch, { padding: Spacings.s2, margin: Spacings.s1 }]}
			>
				<Text>Версия: </Text>
				<Text variant="labelLarge">{Application.nativeApplicationVersion}</Text>
			</View>
			<View
				style={[styles.stretch, { padding: Spacings.s2, margin: Spacings.s1 }]}
			>
				<Text>Версия патча: </Text>
				<Text variant="labelLarge">{Updates.updateId ?? 'Без патча'}</Text>
			</View>
		</ScrollView>
	)
}
