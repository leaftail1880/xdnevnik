import { GithubRelease } from '@/services/github/entities'
import * as FileSystem from 'expo-file-system'
import * as IntentLauncherAndroid from 'expo-intent-launcher'
import * as ExpoSharing from 'expo-sharing'
import { runInAction } from 'mobx'
import { Platform } from 'react-native'
import { Logger } from '../../../constants'
import { RequestError } from '../../../utils/RequestError'
import { ModalAlert } from '../../../utils/Toast'
import State from './state'

export const Filename = Platform.select({
	ios: 'XDnevnik.ipa',
	android: __DEV__ ? 'XDnevnik.Dev.Client.apk' : 'XDnevnik.apk',
})

async function handleErrorsAndDisplayInModal(task: () => Promise<void>) {
	try {
		await task()
	} catch (e) {
		ModalAlert.show('Ошибка при установке', RequestError.stringify(e), true)
		// eslint-disable-next-line no-console
		console.error(e)
	}
}

export function downloadUpdate(
	i: number,
	release: GithubRelease,
	downloaded: boolean,
) {
	handleErrorsAndDisplayInModal(async () => {
		if (!Filename) {
			throw new Error('Обновление работает только в мобильном приложении.')
		}

		const version = release.name
		const fileUrl = FileSystem.cacheDirectory + version + Filename
		if (downloaded) return openInstaller(fileUrl)

		const githubUrl = release.assets.find(
			e => e.name === Filename,
		)?.browser_download_url

		if (!githubUrl) throw new Error('Нет файла, обновление еще собирается!')

		State.setProgress({ i, version, bar: 0 })

		let lastProgressSet = Date.now()
		State.downloader = FileSystem.createDownloadResumable(
			githubUrl,
			fileUrl,
			{},
			p => {
				const percent = p.totalBytesWritten / p.totalBytesExpectedToWrite
				if (Date.now() - lastProgressSet > 500) {
					lastProgressSet = Date.now()
					State.setProgress({
						i,
						version,
						bar: percent,
					})
				}
			},
		)

		performDownload()
	})
}

export function performDownload() {
	handleErrorsAndDisplayInModal(async () => {
		if (!State.downloader || !State.progress) return

		const result =
			await State.downloader[State.paused ? 'resumeAsync' : 'downloadAsync']()
		if (result) {
			runInAction(() => {
				State.files.push({ uri: result.uri, version: State.progress!.version })
				State.setProgress(null)

				openInstaller(result.uri)
			})
		}
	})
}

function openInstaller(fileUrl: string) {
	return handleErrorsAndDisplayInModal(async () => {
		if (Platform.OS === 'android') {
			await IntentLauncherAndroid.startActivityAsync(
				'android.intent.action.INSTALL_PACKAGE',
				{
					data: await FileSystem.getContentUriAsync(fileUrl),
					flags: 1,
				},
			)
		} else {
			await ExpoSharing.shareAsync(fileUrl, {
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
			// 	ModalAlert.alert(
			// 		'Дайте разрешение',
			// 		'XDnevnik всего-лишь скачает один файл в папку Downloads и откроет для Вас проводник чтобы Вы могли обновить XDnevnik и получить новейшие возможности.'
			// 	)
		}
		Logger.info('App installer opened successfully')
	})
}
