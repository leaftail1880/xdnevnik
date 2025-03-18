import { Logger } from '@/constants'
import { GithubRelease } from '@/services/github/entities'
import * as Application from 'expo-application'
import * as FileSystem from 'expo-file-system'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { memo } from 'react'
import { ListRenderItemInfo, StyleSheet, View } from 'react-native'
import { Button, Card, HelperText, ProgressBar } from 'react-native-paper'
import { Spacings } from '../../../utils/Spacings'
import { BetaChip, FilesizeChip, NewVersionChip } from './Chips'
import ReleaseBody from './ReleaseBody'
import Warnings from './Warnings'
import State from './state'
import { Filename, downloadUpdate } from './utils'

export default observer<ListRenderItemInfo<GithubRelease>>(
	function Release(props) {
		if (props.item.name === Application.nativeApplicationVersion) {
			State.currentI = props.index
		}

		const size = props.item.assets.find(e => e.name === Filename)?.size
		return (
			<Card style={{ margin: Spacings.s2 }}>
				<Card.Title title={props.item.name} titleVariant="headlineMedium" />
				<Card.Content style={{ marginBottom: Spacings.s2 }}>
					<View
						style={{
							flexDirection: 'row',
							flex: 1,
							gap: Spacings.s2,
							flexWrap: 'wrap',
						}}
					>
						{props.item.prerelease && <BetaChip />}
						<FilesizeChip size={size} />
						{State.currentI > props.index && <NewVersionChip />}
						<Warnings version={props.item.name} />
					</View>
				</Card.Content>
				<Card.Content>
					<ReleaseBody body={props.item.body} />
				</Card.Content>
				<ReleaseActions release={props.item} i={props.index} />
			</Card>
		)
	},
)

// eslint-disable-next-line mobx/missing-observer
const AlreadyInstalled = memo(function AlreadyInstalled() {
	return (
		<Button disabled mode="contained-tonal">
			Сейчас установлена
		</Button>
	)
})

const InstallOrDownload = observer(function InstallOrDownload(props: {
	release: GithubRelease
	i: number
	downloaded: boolean
}) {
	return (
		<Button
			mode="contained-tonal"
			onPress={() => downloadUpdate(props.i, props.release, props.downloaded)}
		>
			{props.downloaded ? 'Установить' : 'Скачать'}
		</Button>
	)
})

const ReleaseActions = observer(function ReleaseActions(props: {
	release: GithubRelease
	i: number
}) {
	const installed = props.release.name === Application.nativeApplicationVersion
	const downloading = State.progress?.i === props.i
	const downloaded = State.files.find(e => e.version === props.release.name)
	const progress = State.progress

	return (
		<>
			<Card.Content>
				{typeof progress?.bar !== 'undefined' && downloading && (
					<ProgressBar
						progress={progress.bar}
						style={{ marginTop: Spacings.s2 }}
					/>
				)}
			</Card.Content>
			<Card.Actions style={{ gap: Spacings.s2 }}>
				{installed && <AlreadyInstalled />}
				{downloaded && <Delete downloaded={downloaded}></Delete>}
				{progress && downloading && !installed && <Cancel />}
				{progress && !downloading && !installed && <CancelDisabled />}
				{!progress && !installed && (
					<InstallOrDownload downloaded={!!downloaded} {...props} />
				)}
			</Card.Actions>
		</>
	)
})

// eslint-disable-next-line mobx/missing-observer
export const Cancel = function Cancel() {
	return (
		<Button
			icon={'cancel'}
			mode="contained-tonal"
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
	)
}

// eslint-disable-next-line mobx/missing-observer
export const CancelDisabled = function CancelDisabled() {
	return (
		<Button
			mode="contained-tonal"
			disabled
			style={styles.cancelDisabledStyle}
			contentStyle={styles.contentStyleCancelDisabled}
		>
			<HelperText type="info">Отмените другие загрузки</HelperText>
		</Button>
	)
}

export const Delete = observer(function Delete(props: {
	downloaded: (typeof State)['files'][number]
}) {
	return (
		<Button
			mode="contained-tonal"
			icon="delete"
			onPress={() => {
				// Finally bc if it fails to delete then there is no way to redownload it
				FileSystem.deleteAsync(props.downloaded.uri)
					.finally(() => {
						runInAction(() => {
							State.files = State.files.filter(
								e => e.uri !== props.downloaded.uri,
							)
						})
					})
					.catch(() => {
						Logger.debug('No file found to be deleted:', props.downloaded.uri)
					})
			}}
		>
			Удалить
		</Button>
	)
})
const styles = StyleSheet.create({
	contentStyleCancelDisabled: {
		padding: 0,
		alignItems: 'center',
		justifyContent: 'center',
		alignContent: 'center',
	},
	cancelDisabledStyle: {
		padding: 0,
	},
})
