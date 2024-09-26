import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { View } from 'react-native'
import { Button, Divider, Text } from 'react-native-paper'

import Mark from '~components/Mark'

import { Theme } from '~models/theme'
import { TermStore } from '~screens/totals/term/state'
import { Assignment, Attachment } from '~services/net-school/entities'
import { AttachmentsStore } from '~services/net-school/store'
import { LANG } from '../../constants'
import { Spacings } from '../../utils/Spacings'
import { TermNavigationParamMap } from '../totals/navigation'
import { DiaryLessonProps } from './screen'
// import * as FileSystem from 'expo-file-system'
// import * as ExpoSharing from 'expo-sharing'
// import { Alert } from 'react-native'
// import { API } from '~services/net-school/api'
// import { ROUTES } from '../net-school/routes'

// TODO support attachment

export default observer(function DiaryAssignment({
	assignment,
	navigation,
	lesson,
}: {
	assignment: Assignment
} & Pick<DiaryLessonProps, 'navigation' | 'lesson'>) {
	const [showHomework, setShowHomework] = useState(
		// Do not show long homework by default
		assignment.assignmentName.length < 40,
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
					onPress={() => setShowHomework(!showHomework)}
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
					onPress={() => {
						const currentTerm = TermStore.currentTerm

						currentTerm &&
							// @ts-expect-error Huh
							navigation.navigate(LANG['s_totals'], {
								screen: LANG['s_subject_totals'],
								params: {
									subjectId: lesson.subjectId,
									termId: currentTerm.id,
									finalMark: null,
								} satisfies TermNavigationParamMap[(typeof LANG)['s_subject_totals']],
							})
					}}
				/>

				{showHomework &&
					((assignment.attachmentsExists && attachments.fallback) ||
						(attachment &&
							attachment.map(e => (
								<AttachmentFile attachment={e} key={e.attachmentId} />
							))))}
			</View>
		</>
	)
})

const AttachmentFile = observer(function AttachmentFile({
	attachment,
}: {
	attachment: Attachment
}) {
	return (
		<Button
			style={{
				margin: Spacings.s1,
				padding: Spacings.s2,
				elevation: 2,
			}}
			onPress={async () => {
				// const fileUri = FileSystem.cacheDirectory + 'update.apk'
				// const file = await API.get(ROUTES.getAttachment + '/' + attachment.attachmentId, {
				// 	auth: true,
				// })
				// const downloader = FileSystem.createDownloadResumable(
				// 	API.en,
				// 	fileUri,
				// 	{
				// 		headers: {
				// 			Authorization: 'Bearer ' + API.session?.access_token,
				// 		},
				// 	},
				// 	p => {
				// 		setProgress(
				// 			'Скачивание: ' +
				// 				(
				// 					(p.totalBytesWritten / p.totalBytesExpectedToWrite) *
				// 					100
				// 				).toFixed(2) +
				// 				'%'
				// 		)
				// 	}
				// )
				// const result = await downloader.downloadAsync()
				// if (!result) {
				// 	ModalAlert.alert('Не удалось сохранить вложение')
				// 	throw new Error('Failed to download update')
				// }
			}}
		>
			<Text>{attachment.fileName}</Text>
		</Button>
	)
})
