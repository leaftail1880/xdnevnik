import * as FileSystem from 'expo-file-system'
import * as IntentLauncherAndroid from 'expo-intent-launcher'
// import * as MediaLibrary from 'expo-media-library'
// import * as Permissions from 'expo-permissions'
import * as Application from 'expo-application'
import * as ExpoSharing from 'expo-sharing'
import * as Updates from 'expo-updates'
import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { memo } from 'react'
import {
	Alert,
	FlatList,
	Linking,
	ListRenderItem,
	ListRenderItemInfo,
	Platform,
	View,
} from 'react-native'
import {
	Badge,
	Button,
	Card,
	Chip,
	ProgressBar,
	Text,
} from 'react-native-paper'
import { UpdateDate } from '../../Components/UpdateDate'
import { Github, GithubRelease } from '../../GithubUpdate/update'
import { Logger, styles } from '../../Setup/constants'
import { Theme } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'
import { makeReloadPersistable } from '../../utils/makePersistable'

const Filename = Platform.select({
	ios: 'XDnevnik.ipa',
	android: __DEV__ ? 'XDnevnik.Dev.Client.apk' : 'XDnevnik.apk',
})

// eslint-disable-next-line mobx/missing-observer
function UpdateInfo() {
	return (
		<Card style={{ margin: Spacings.s2, marginTop: Spacings.s3 }}>
			<Card.Content style={styles.stretch}>
				<Text>Версия: </Text>
				<Text variant="labelLarge">{Application.nativeApplicationVersion}</Text>
			</Card.Content>
			<Card.Content style={styles.stretch}>
				<Text>Сборка: </Text>
				<Text variant="labelLarge">{Updates.updateId ?? 'По умолчанию'}</Text>
			</Card.Content>
		</Card>
	)
}

export default observer(function UpdatesScreen() {
	if (Github.Releases.fallback)
		return (
			<View>
				<UpdateInfo />
				{Github.Releases.fallback}
			</View>
		)

	return (
		<FlatList
			refreshControl={Github.Releases.refreshControl}
			data={Github.Releases.result}
			maxToRenderPerBatch={2}
			ListHeaderComponent={UpdateInfo}
			ListFooterComponent={
				<UpdateDate key={'updates'} store={Github.Releases} />
			}
			keyExtractor={KetExtractor}
			renderItem={Release}
		/>
	)
})

// eslint-disable-next-line mobx/missing-observer
const KetExtractor = (i: GithubRelease) => i.id + ''
// eslint-disable-next-line mobx/missing-observer
const Release: ListRenderItem<GithubRelease> = function Release(
	props: ListRenderItemInfo<GithubRelease>
) {
	if (props.item.name === Application.nativeApplicationVersion) {
		UpdateState.currentI = props.index
	}
	const size = props.item.assets.find(e => e.name === Filename)?.size
	return (
		<Card style={{ margin: Spacings.s2 }}>
			<Card.Title title={props.item.name} titleVariant="headlineMedium" />
			<Card.Content style={{ marginBottom: Spacings.s2 }}>
				<View style={{ flexDirection: 'row', flex: 1 }}>
					{props.item.prerelease && <Chip>Бета</Chip>}

					<Chip
						style={{
							marginHorizontal: Spacings.s2,
						}}
					>
						{size ? `${(size / 1024 / 1024).toFixed(2)}мб` : 'Файла нет'}
					</Chip>

					{UpdateState.currentI > props.index && (
						<Chip
							style={{
								backgroundColor: Theme.colors.errorContainer,
							}}
						>
							Новая версия
							<View>
								<Badge
									style={{
										position: 'relative',
										top: -8,
										right: -2,
									}}
									size={6}
								/>
							</View>
						</Chip>
					)}
				</View>
			</Card.Content>
			<Card.Content>
				<ReleaseBody body={props.item.body} />
			</Card.Content>
			<Update release={props.item} i={props.index} />
		</Card>
	)
}

// eslint-disable-next-line mobx/missing-observer
const ReleaseBody = memo(function ReleaseBody(props: { body: string }) {
	let body = props.body

	let whatsChanged = false
	const headerR = body.replace(/^## What's Changed/, '')
	if (body !== headerR) {
		whatsChanged = true
		body = headerR
	}

	let fullchangelog: { versions: string; link: string } | undefined
	const footerR = body.match(
		/(\*\*Full Changelog\*\*: (https:\/\/github\.com\/[^/]+\/[^/]+\/compare\/([\d.]+...[\d.]+)))/
	)
	if (footerR?.[1]) {
		fullchangelog = { versions: footerR[3], link: footerR[2] }
		body = body.replace(footerR[1], '')
	}

	return (
		<Text variant="bodyMedium">
			{whatsChanged && <Text variant="titleMedium">Изменения</Text>}
			<Text>{body}</Text>
			{fullchangelog && (
				<Text variant="titleSmall">
					Все изменения:{' '}
					<Text
						style={{ color: Theme.colors.secondary }}
						onPress={() => {
							fullchangelog && Linking.openURL(fullchangelog.link)
						}}
					>
						{fullchangelog.versions}
					</Text>
				</Text>
			)}
		</Text>
	)
})

const UpdateState = new (class {
	progress: null | { i: number; bar?: number } = null
	files: { uri: string; version: string }[] = []
	downloader?: FileSystem.DownloadResumable
	paused = false
	currentI = 0

	setProgress(progress: (typeof this)['progress']) {
		this.progress = progress
	}

	constructor() {
		makeAutoObservable(
			this,
			{ downloader: false, currentI: false },
			{ autoBind: true }
		)
		makeReloadPersistable(this, { name: 'updates', properties: ['files'] })
	}
})()
const Update = observer(function Update(props: {
	release: GithubRelease
	i: number
}) {
	const alreadyInstalled =
		props.release.name === Application.nativeApplicationVersion
	const downloaded = UpdateState.files.find(
		e => e.version === props.release.name
	)
	const currentDownloading = UpdateState.progress?.i === props.i
	const progress = UpdateState.progress

	return (
		<>
			<Card.Content>
				{!!progress?.bar && currentDownloading && (
					<ProgressBar progress={progress.bar} />
				)}
			</Card.Content>
			<Card.Actions>
				{alreadyInstalled && (
					<Button disabled mode="contained-tonal">
						Сейчас установлена
					</Button>
				)}
				{downloaded && (
					<Button
						mode="contained-tonal"
						icon="delete"
						onPress={() => {
							// Finally bc if it fails to delete then there is no way to redownload it
							FileSystem.deleteAsync(downloaded.uri).finally(() => {
								runInAction(() => {
									UpdateState.files = UpdateState.files.filter(
										e => e.uri !== downloaded.uri
									)
								})
							})
						}}
					>
						Удалить
					</Button>
				)}
				{progress && currentDownloading && !alreadyInstalled && (
					<>
						<Button
							icon={'cancel'}
							mode="contained-tonal"
							style={{ marginRight: Spacings.s1 }}
							onPress={() => {
								runInAction(() => {
									UpdateState.progress = null
								})
								UpdateState.downloader?.cancelAsync()
								delete UpdateState.downloader
							}}
						>
							Отменить
						</Button>
						<Button
							icon={'pause'}
							mode="contained-tonal"
							onPress={() => {
								UpdateState.downloader?.pauseAsync()
								runInAction(() => {
									UpdateState.paused = true
								})
							}}
						>
							{!UpdateState.paused ? 'Пауза' : 'Продолжить'}
						</Button>
					</>
				)}
				{progress && !currentDownloading && !alreadyInstalled && (
					<Button mode="contained-tonal" disabled>
						Остановите другие обновления
					</Button>
				)}
				{!progress && !alreadyInstalled && (
					<Button
						mode="contained-tonal"
						onPress={() =>
							openAppInstaller(props.i, props.release, !!downloaded)
						}
					>
						{downloaded ? 'Установить' : 'Скачать'}
					</Button>
				)}
			</Card.Actions>
		</>
	)
})

const openAppInstaller = async (
	i: number,
	release: GithubRelease,
	downloaded: boolean
) => {
	try {
		if (!Filename) {
			Alert.alert('Обновление работает только в мобильном приложении')
			return
		}

		const download = async (uri: string, fileUri: string) => {
			if (downloaded) return
			UpdateState.setProgress({ i, bar: 0 })
			let lastProgressSet = Date.now()
			UpdateState.downloader = FileSystem.createDownloadResumable(
				uri,
				fileUri,
				{},
				p => {
					const percent = p.totalBytesWritten / p.totalBytesExpectedToWrite
					if (Date.now() - lastProgressSet < 500) {
						lastProgressSet = Date.now()
						UpdateState.setProgress({
							i,
							bar: percent,
						})
					}
				}
			)

			const result = await UpdateState.downloader.downloadAsync()
			if (!result) {
				UpdateState.setProgress(null)
				throw new Error('Не удалось скачать обновление')
			} else {
				runInAction(() => {
					UpdateState.progress = null
					UpdateState.files.push({ uri: result.uri, version: release.name })
				})
				return result
			}
		}

		const fileUrl = FileSystem.cacheDirectory + release.name + Filename
		const githubUrl = release.assets.find(
			e => e.name === Filename
		)?.browser_download_url
		if (!githubUrl) throw new Error('Нет файла, обновление еще собирается!')

		await download(githubUrl, fileUrl)

		if (Platform.OS === 'android') {
			await IntentLauncherAndroid.startActivityAsync(
				'android.intent.action.INSTALL_PACKAGE',
				{
					data: await FileSystem.getContentUriAsync(fileUrl),
					flags: 1,
				}
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
