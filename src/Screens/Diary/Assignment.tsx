import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { Colors, Spacings, Text, View } from 'react-native-ui-lib'
import { Button, SmallButton } from '../../Componentss/Button'
import { Mark } from '../../Componentss/Mark'
import { Assignment, Attachment } from '../../NetSchool/classes'
import { AttachmentsStore } from './stores'
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
		// assignment.assignmentTypeName.length < 20
		true
	)

	const attachments = AttachmentsStore

	const attachment =
		assignment.attachmentsExists &&
		attachments.result &&
		attachments.result?.filter(e => e.assignmentId === assignment.assignmentId)

	return (
		<View
			margin-s2
			backgroundColor={Colors.$backgroundAccent}
			padding-s1
			br20
			style={{ elevation: 10 }}
		>
			<View row spread centerV>
				<View row marginH-s1 style={{ width: '80%' }}>
					{assignment.assignmentTypeName && (
						<SmallButton
							onPress={() => setShowHw(!showHw)}
							style={{
								borderColor: Colors.$textAccent,
								borderWidth: 2,
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
						</SmallButton>
					)}
					{showHw && (
						<Text
							$textAccent
							margin-s2
							style={{ width: '85%', alignSelf: 'center' }}
							selectable
						>
							{assignment.assignmentTypeName}: {assignment.assignmentName}
						</Text>
					)}
				</View>

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
							padding: 0,
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
