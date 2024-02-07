import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import {
	Colors,
	Spacings,
	Text,
	TouchableOpacity,
	View,
} from 'react-native-ui-lib'
import { Button } from '../../Components/Button'
import { Mark } from '../../Components/Mark'
import { Assignment, Attachment } from '../../NetSchool/classes'
import { AttachmentsStore } from '../../Stores/API.stores'
// import * as FileSystem from 'expo-file-system'
// import * as ExpoSharing from 'expo-sharing'
// import { Alert } from 'react-native'
// import { API } from '../NetSchool/api'
// import { ROUTES } from '../NetSchool/routes'

// TODO support attachment

export const DiaryAssignment = observer(function DiaryAssignment({
	assignment,
}: {
	assignment: Assignment
}) {
	const [showHw, setShowHw] = useState(
		// Do not show long hw by default
		assignment.assignmentName.length < 40
	)

	const attachments = AttachmentsStore

	const attachment =
		assignment.attachmentsExists &&
		attachments.result &&
		attachments.result?.filter(e => e.assignmentId === assignment.assignmentId)

	return (
		<View
			margin-s1
			backgroundColor={Colors.rgba(Colors.$backgroundPrimaryLight, 0.2)}
			padding-s1
			br20
		>
			<View row spread centerV style={{ width: '100%' }}>
				{assignment.assignmentTypeName && (
					<TouchableOpacity
						onPress={() => setShowHw(!showHw)}
						style={{
							backgroundColor: Colors.rgba(Colors.$textAccent, 0.2),
							width: 45,
							height: 45,
							alignSelf: 'center',
						}}
						centerH
						centerV
						br20
					>
						<Text $textAccent margin-s1>
							{assignment.assignmentTypeAbbr}
						</Text>
					</TouchableOpacity>
				)}

				<Text
					$textAccent
					margin-s2
					style={{ alignSelf: 'center', width: '60%' }}
					selectable
				>
					{showHw
						? `${assignment.assignmentTypeName}: ${assignment.assignmentName}`
						: '...'}
				</Text>

				<View row center>
					<Mark
						noColor={Colors.rgba(Colors.$textAccent, 0.5)}
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
							alignSelf: 'center',
						}}
						textStyle={{ fontSize: 16 }}
						subTextStyle={{ fontSize: 14, alignSelf: 'center' }}
					/>
				</View>
			</View>

			{showHw &&
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
				backgroundColor: Colors.$backgroundPrimaryLight,
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
