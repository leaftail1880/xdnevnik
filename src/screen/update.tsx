import * as Device from 'expo-device'
import * as FileSystem from 'expo-file-system'
import * as IntentLauncherAndroid from 'expo-intent-launcher'
// import * as MediaLibrary from 'expo-media-library'
// import * as Permissions from 'expo-permissions'
import * as ExpoSharing from 'expo-sharing'
import { Alert } from 'react-native'
import { getLatestGithubReleaseUrl } from '../GithubUpdate/update'
import { Button } from '../components/button'
import { Text } from '../components/text'
import { LOGGER, styles } from '../constants'

const openAppInstaller = async (download: typeof FileSystem.downloadAsync) => {
	try {
		if (Device.deviceType !== Device.DeviceType.PHONE || !Device.osName) {
			Alert.alert('Обновление вне телефона не поддерживается')
			return
		}

		if (Device.osName === 'Android') {
			const release = await getLatestGithubReleaseUrl('XDnevnik.apk', {})
			if (!release) return
			const uri = FileSystem.cacheDirectory + 'update.apk'

			await download(release, uri)
			await IntentLauncherAndroid.startActivityAsync(
				'android.intent.action.INSTALL_PACKAGE',
				{
					data: uri,
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
		LOGGER.info('App installer opened successfully')
	} catch (error) {
		LOGGER.error('Failed to open the app installer', error)
	}
}

export function UpdatesButton() {
	return (
		<Button
			style={styles.settingBase}
			onPress={async () => {
				try {
					const result = await openAppInstaller(async (uri, fileUri) => {
						const downloader = FileSystem.createDownloadResumable(uri, fileUri)

						const result = await downloader.downloadAsync()
						if (!result) throw new Error('Failed to download update')
						return result
					})

					if (typeof result === 'undefined') {
						Alert.alert('Обновлений нету.')
					}
				} catch (error) {
					Alert.alert(`Не удалось получить обновление`, '' + error)
				}
			}}
		>
			<Text>Проверить обновления</Text>
		</Button>
	)
}
