import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { View } from 'react-native'
import { Button, Text, TouchableRipple } from 'react-native-paper'

import Mark from '../../Components/Mark'

import { Assignment, Attachment } from '../../NetSchool/classes'
import { LANG } from '../../Setup/constants'
import { AttachmentsStore } from '../../Stores/NetSchool'
import { Settings } from '../../Stores/Settings'
import { Theme } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'
import { TermNavigationParamMap } from '../Totals/navigation'
import { DiaryLessonProps } from './Lesson'
// import * as FileSystem from 'expo-file-system'
// import * as ExpoSharing from 'expo-sharing'
// import { Alert } from 'react-native'
// import { API } from '../NetSchool/api'
// import { ROUTES } from '../NetSchool/routes'

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
		assignment.assignmentName.length < 40
	)

	const attachments = AttachmentsStore

	const attachment =
		assignment.attachmentsExists &&
		attachments.result &&
		attachments.result?.filter(e => e.assignmentId === assignment.assignmentId)

	return (
		<View
			style={{
				borderRadius: Theme.roundness,
				margin: Spacings.s2,
				flexDirection: 'row',
				justifyContent: 'space-between',
				alignContent: 'stretch',
				alignItems: 'center',
			}}
		>
			{assignment.assignmentTypeName && (
				<TouchableRipple
					onPress={() => setShowHomework(!showHomework)}
					style={{
						borderRadius: Theme.roundness,
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: Theme.colors.primaryContainer,
						width: 45,
						height: 45,
						alignSelf: 'center',
					}}
				>
					<Text style={{ margin: Spacings.s2 }}>
						{assignment.assignmentTypeAbbr}
					</Text>
				</TouchableRipple>
			)}

			<Text
				style={{ alignSelf: 'center', width: '60%', margin: Spacings.s2 }}
				selectable
			>
				{showHomework
					? `${assignment.assignmentTypeName}: ${assignment.assignmentName}`
					: '...'}
			</Text>

			<Mark
				mark={assignment.result ?? 'Нет'}
				duty={assignment.duty}
				markWeight={{
					max: assignment.weight,
					min: assignment.weight,
					current: assignment.weight,
				}}
				style={{
					width: 45,
					height: 45,
				}}
				onPress={() => {
					Settings.currentTerm &&
						// @ts-expect-error Huh
						navigation.navigate(LANG['s_totals'], {
							screen: LANG['s_subject_totals'],
							params: {
								subjectId: lesson.subjectId,
								termId: Settings.currentTerm.id,
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
				// 	Alert.alert('Не удалось сохранить вложение')
				// 	throw new Error('Failed to download update')
				// }
			}}
		>
			<Text>{attachment.fileName}</Text>
		</Button>
	)
})
