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
	FlatList,
	Linking,
	ListRenderItem,
	ListRenderItemInfo,
	Platform,
	StyleSheet,
	View,
} from 'react-native'
import {
	Badge,
	Button,
	Card,
	Chip,
	HelperText,
	ProgressBar,
	Text,
} from 'react-native-paper'

import semver from 'semver'
import { ModalAlert } from '../../Components/Modal'
import UpdateDate from '../../Components/UpdateDate'
import { Github, GithubRelease } from '../../GithubUpdate/update'
import { Logger, styles as globalStyles } from '../../Setup/constants'
import { Theme } from '../../Stores/Theme'
import { RequestError } from '../../utils/RequestError'
import { Spacings } from '../../utils/Spacings'
import { makeReloadPersistable } from '../../utils/makePersistable'

const Filename = Platform.select({
	ios: 'XDnevnik.ipa',
	android: __DEV__ ? 'XDnevnik.Dev.Client.apk' : 'XDnevnik.apk',
})

const minFeatureVersions = {
	updatesScreen: [
		'0.13.1',
		'Старые обновления',
		'В этой версии поддерживается обновление только до последней версии, вы не сможете выбрать версию из списка, как сейчас',
	],
	oldStorage: [
		'0.12.0',
		'Старое хранилище',
		'В этой версии данные хранились по-другому, ваши настройки там не будут использованы. Но и удалены не будут.',
	],
	login: [
		'0.0.6',
		'Сломан вход',
		'В этой версии сломан вход, придется перезаходить',
	],
	inAppUpdate: [
		'0.0.1',
		'Нет обновлений',
		'В этой версии нет обновлений внутри приложения, вам нужно будет вручную скачать и установить новую версию',
	],
} satisfies Record<string, [string, string, string]>

const buildInfo = () =>
	ModalAlert.show(
		'Версия сборки',
		'Некоторые баги не требуют обновления всего дневника, для них создается небольшая сборка которую приложение устанавливает при каждом запуске.\nПолная версия сборки: ' +
			(Updates.updateId ?? 'По умолчанию')
	)

export function getUpdateIdShort() {
	return Updates.updateId?.slice(-6)
}

// eslint-disable-next-line mobx/missing-observer
const UpdateInfo = memo(function UpdateInfo() {
	return (
		<Card style={styles.updatesCard}>
			<Card.Content style={globalStyles.stretch}>
				<Text>Версия: </Text>
				<Text variant="labelLarge">{Application.nativeApplicationVersion}</Text>
			</Card.Content>
			<Card.Content style={globalStyles.stretch}>
				<Text>Сборка: </Text>
				<Text variant="labelLarge" onPress={buildInfo}>
					{getUpdateIdShort() ?? 'По умолчанию'}
				</Text>
			</Card.Content>
		</Card>
	)
})

const styles = StyleSheet.create({
	updatesCard: { margin: Spacings.s2, marginTop: Spacings.s3 },
})

// TODO Filter beta
// TODO Toggle tips

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
			renderItem={renderItem}
		/>
	)
})

// eslint-disable-next-line mobx/missing-observer
const KetExtractor = (i: GithubRelease) => i.id + ''

const renderItem: ListRenderItem<GithubRelease> = props => (
	<Release {...props} />
)
const Release: ListRenderItem<GithubRelease> = observer(function Release(
	props: ListRenderItemInfo<GithubRelease>
) {
	if (props.item.name === Application.nativeApplicationVersion) {
		State.currentI = props.index
	}

	const size = props.item.assets.find(e => e.name === Filename)?.size
	return (
		<Card style={{ margin: Spacings.s2 }}>
			<Card.Title title={props.item.name} titleVariant="headlineMedium" />
			<Card.Content style={{ marginBottom: Spacings.s2 }}>
				<View style={{ flexDirection: 'row', flex: 1 }}>
					{props.item.prerelease && <BetaChip />}
					<FilesizeChip size={size} />
					{State.currentI > props.index && <NewVersionChip />}
				</View>
				<Warnings version={props.item.name} />
			</Card.Content>
			<Card.Content>
				<ReleaseBody body={props.item.body} />
			</Card.Content>
			<Update release={props.item} i={props.index} />
		</Card>
	)
})

// eslint-disable-next-line mobx/missing-observer
const Warnings = memo(function Warnings(props: { version: string }) {
	// eslint-disable-next-line react/prop-types
	if (!props.version) return false
	const versionNum = semver.parse(props.version)

	return (
		<View
			style={{
				flexDirection: 'row',
				flexWrap: 'wrap',
				flex: 1,
			}}
		>
			{Object.entries(minFeatureVersions)
				.filter(e => {
					const compare = versionNum?.compare(e[1][0])
					if (compare === -1 || compare === 0) return true

					return false
				})
				.map(e => (
					<Chip
						key={e[1][1]}
						style={{
							marginTop: Spacings.s2,
							marginRight: Spacings.s2,
							backgroundColor: Theme.colors.errorContainer,
						}}
						onPress={() => {
							ModalAlert.show(e[1][1], e[1][2])
						}}
					>
						{e[1][1]}
					</Chip>
				))}
		</View>
	)
})

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

const State = new (class {
	progress: null | { i: number; bar?: number; version: string } = null
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
	const downloaded = State.files.find(e => e.version === props.release.name)
	const currentDownloading = State.progress?.i === props.i
	const progress = State.progress

	return (
		<>
			<Card.Content>
				{typeof progress?.bar !== 'undefined' && currentDownloading && (
					<ProgressBar
						progress={progress.bar}
						color="white"
						style={{ marginTop: Spacings.s2 }}
					/>
				)}
			</Card.Content>
			<Card.Actions>
				{alreadyInstalled && (
					<Button disabled mode="contained-tonal">
						Сейчас установлена
					</Button>
				)}
				{
					downloaded && (
						<Button
							mode="contained-tonal"
							icon="delete"
							onPress={() => {
								// Finally bc if it fails to delete then there is no way to redownload it
								FileSystem.deleteAsync(downloaded.uri).finally(() => {
									runInAction(() => {
										State.files = State.files.filter(
											e => e.uri !== downloaded.uri
										)
									})
								})
							}}
						>
							Удалить
						</Button>
					)
				}
				{
					progress && currentDownloading && !alreadyInstalled && (
						<>
							<Button
								icon={'cancel'}
								mode="contained-tonal"
								style={{ marginRight: Spacings.s1 }}
								onPress={() => {
									runInAction(() => {
										State.progress = null
									})
									State.downloader?.cancelAsync()
									delete State.downloader
								}}
							>
								Отменить
							</Button>
							<Button
								icon={State.paused ? 'play' : 'pause'}
								mode="contained-tonal"
								onPress={() =>
									runInAction(() => {
										if (!State.paused) {
											State.paused = true
											State.downloader?.pauseAsync()
										} else {
											State.paused = false
											performDownload()
										}
									})
								}
							>
								{!State.paused ? 'Пауза' : 'Продолжить'}
							</Button>
						</>
					)
				}
				{progress && !currentDownloading && !alreadyInstalled && (
					<Button
						mode="contained-tonal"
						disabled
						style={{
							padding: 0,
						}}
						contentStyle={{
							padding: 0,
							alignItems: 'center',
							justifyContent: 'center',
							alignContent: 'center',
						}}
					>
						<HelperText type="info">Отмените другие загрузки</HelperText>
					</Button>
				)}
				{!progress && !alreadyInstalled && (
					<Button
						mode="contained-tonal"
						onPress={() => downloadUpdate(props.i, props.release, !!downloaded)}
					>
						{downloaded ? 'Установить' : 'Скачать'}
					</Button>
				)}
			</Card.Actions>
		</>
	)
})

// eslint-disable-next-line mobx/missing-observer
const BetaChip = function BetaChip() {
	return (
		<Chip
			style={{
				marginRight: Spacings.s2,
			}}
			onPress={() =>
				ModalAlert.show(
					'Бета версия',
					'Эта версия приложения может работать нестабильно, но содержит новые функции. Пробуйте на свой страх и риск.'
				)
			}
		>
			Бета
		</Chip>
	)
}

// eslint-disable-next-line mobx/missing-observer
const FilesizeChip = memo(function FilesizeChip({
	size,
}: {
	size: number | undefined
}) {
	return (
		<Chip
			style={{
				marginRight: Spacings.s2,
			}}
			onPress={() =>
				ModalAlert.show(
					size ? 'Вес файла' : 'Файла нет',
					size
						? 'Показывает, сколько весит .APK или .IPA файл. Не является тем же весом, что вы получите после установки.'
						: 'После публикации обновления нужно время, чтобы оно было собрано и запакованно в файл. Сборка обычно занимает 6-7 минут. Наберитесь терпения, скоро он появится!'
				)
			}
		>
			{size ? `${(size / 1024 / 1024).toFixed(2)}мб` : 'Файла нет'}
		</Chip>
	)
})

// eslint-disable-next-line mobx/missing-observer
function NewVersionChip() {
	return (
		<Chip
			style={{
				backgroundColor: Theme.colors.errorContainer,
			}}
			onPress={() =>
				ModalAlert.show(
					'Новая версия!',
					'Обновитесь скорее, чтобы получить новые функции и фиксы багов!'
				)
			}
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
	)
}

async function handleErrorsAndDisplayInModal(task: () => Promise<void>) {
	try {
		await task()
	} catch (e) {
		ModalAlert.show('Ошибка при установке', RequestError.stringify(e), true)
		// eslint-disable-next-line no-console
		console.error(e)
	}
}

function downloadUpdate(
	i: number,
	release: GithubRelease,
	downloaded: boolean
) {
	handleErrorsAndDisplayInModal(async () => {
		if (!Filename) {
			throw new Error('Обновление работает только в мобильном приложении.')
		}

		const version = release.name
		const fileUrl = FileSystem.cacheDirectory + version + Filename
		if (downloaded) return openInstaller(fileUrl)

		const githubUrl = release.assets.find(
			e => e.name === Filename
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
			}
		)

		performDownload()
	})
}

function performDownload() {
	handleErrorsAndDisplayInModal(async () => {
		if (!State.downloader || !State.progress) return

		const result = await State.downloader[
			State.paused ? 'resumeAsync' : 'downloadAsync'
		]()
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
			// 	ModalAlert.alert(
			// 		'Дайте разрешение',
			// 		'XDnevnik всего-лишь скачает один файл в папку Downloads и откроет для Вас проводник чтобы Вы могли обновить XDnevnik и получить новейшие возможности.'
			// 	)
		}
		Logger.info('App installer opened successfully')
	})
}
