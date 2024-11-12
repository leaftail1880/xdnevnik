import * as FileSystem from 'expo-file-system'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { Image, View } from 'react-native'
import { Chip, Divider, Text } from 'react-native-paper'
import Mark from '~components/Mark'

import { shareAsync } from 'expo-sharing'
import { Size } from '~components/Size'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { API } from '~services/net-school/api'
import { Assignment, Attachment } from '~services/net-school/entities'
import { ROUTES } from '~services/net-school/routes'
import { AttachmentsStore } from '~services/net-school/store'
import { ModalAlert } from '~utils/Toast'
import { Logger } from '../../constants'
import { Spacings } from '../../utils/Spacings'
import { DiaryLessonProps } from './screen'

// TODO support adding attachment

export default observer(function DiaryAssignment({
	assignment,
	navigateToLessonMarks,
}: {
	assignment: Assignment
} & DiaryLessonProps) {
	const [showHomework, setShowHomework] = useState(
		// Do not show long homework by default
		!(
			Settings.collapseLongAssignmentText &&
			assignment.assignmentName.length > 40
		),
	)

	const attachments = AttachmentsStore

	const attachment =
		assignment.attachmentsExists &&
		attachments.result &&
		attachments.result?.filter(e => e.assignmentId === assignment.assignmentId)

	return (
		<>
			<Divider style={{ marginTop: Spacings.s1 }} />
			<View
				style={{
					borderRadius: Theme.roundness,
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignContent: 'stretch',
					alignItems: 'center',
					marginTop: Spacings.s1,
				}}
			>
				<Text
					style={{ alignSelf: 'center', flex: 1 }}
					selectable
					onPress={
						Settings.collapseLongAssignmentText
							? () => setShowHomework(!showHomework)
							: undefined
					}
				>
					{showHomework
						? `${assignment.assignmentTypeName}: ${assignment.assignmentName}`
						: '...'}
				</Text>

				<Mark
					mark={assignment.result ?? 'Нет'}
					duty={assignment.duty}
					weight={assignment.weight}
					maxWeight={assignment.weight}
					minWeight={assignment.weight}
					style={{ padding: Spacings.s1, paddingHorizontal: Spacings.s2 }}
					onPress={navigateToLessonMarks}
				/>
			</View>
			{showHomework &&
				((assignment.attachmentsExists && attachments.fallback) ||
					(attachment && (
						<View style={{ width: '100%' }}>
							{attachment.map(e => (
								<AttachmentFile attachment={e} key={e.attachmentId} />
							))}
						</View>
					)))}
		</>
	)
})

const AttachmentFile = observer(function AttachmentFile({
	attachment,
}: {
	attachment: Attachment
}) {
	const fileUri = `${FileSystem.cacheDirectory}${attachment.attachmentId}-${attachment.fileName}`
	const isImage = /\.(jpeg|png|jpg)$/.test(attachment.fileName)

	const [progress, setProgress] = useState<null | string>(null)
	const [size, setSize] = useState<false | number>(false)

	useEffect(() => {
		checkSize(fileUri, setSize)
	}, [fileUri])

	return (
		<Chip
			mode="flat"
			icon={isImage ? 'camera' : 'file'}
			style={{
				margin: Spacings.s1,
				padding: Spacings.s1,
			}}
			onPress={async () => {
				if (!size) {
					const result = await downloadAttachment(
						attachment,
						fileUri,
						setProgress,
					)
					checkSize(result.uri, setSize)
				} else {
					Logger.debug('File already downloaded. Size is', size)
				}

				setProgress(null)
				const share = () => shareAsync(fileUri, { dialogTitle: 'Файл' })
				Logger.debug('Sharing', fileUri)

				if (isImage) {
					ModalAlert.show(
						'Вложение',
						<View
							style={{
								alignItems: 'center',
								justifyContent: 'center',
								gap: Spacings.s1,
							}}
						>
							<Text>{attachment.fileName}</Text>
							<Image source={{ uri: fileUri, width: 200, height: 400 }}></Image>
							<Chip mode="flat" onPress={share}>
								Отправить
							</Chip>
						</View>,
					)
				} else share()
			}}
		>
			<View style={{ flex: 1, gap: Spacings.s1, flexDirection: 'row' }}>
				<Text>{attachment.fileName}</Text>
				{size && <Size t={size} />}
				<Text>{progress}</Text>
			</View>
		</Chip>
	)
})

async function downloadAttachment(
	attachment: Attachment,
	fileUri: string,
	setProgress: React.Dispatch<string | null>,
) {
	const httpUri = API.join(ROUTES.getAttachment, attachment.attachmentId + '')
	Logger.debug('Saving', attachment.fileName, 'from the', httpUri)
	const downloader = FileSystem.createDownloadResumable(
		httpUri,
		fileUri,
		{
			headers: {
				Authorization: 'Bearer ' + API.session?.access_token,
			},
		},
		p => {
			setProgress(
				'Скачивание: ' +
					((p.totalBytesWritten / p.totalBytesExpectedToWrite) * 100).toFixed(
						2,
					) +
					'%',
			)
		},
	)

	const result = await downloader.downloadAsync()
	if (!result || result.status !== 200) {
		ModalAlert.show(
			'Не удалось сохранить вложение',
			'С аккаунта родителя можно скачать только некоторые вложения',
			true,
		)
		throw new Error('Failed to download file')
	}

	return result
}

function checkSize(fileUri: string, setSize: React.Dispatch<number | false>) {
	FileSystem.getInfoAsync(fileUri).then(info => {
		if (info.exists && !info.isDirectory) {
			setSize(info.size)
		}
	})
}
