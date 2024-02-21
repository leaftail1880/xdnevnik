import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Button, Surface, Text } from 'react-native-paper'
import { Mark } from '../../Components/Mark'
import { Spacings } from '../../Components/Spacings'
import { Assignment, Attachment } from '../../NetSchool/classes'
import { AttachmentsStore } from '../../Stores/API'
import { Theme } from '../../Stores/Theme'
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
		<View>
			<Surface
				elevation={2}
				style={{
					borderRadius: Theme.roundness,
					marginVertical: Spacings.s2,
					margin: Spacings.s1,
					padding: Spacings.s1,
					width: '97%',
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignContent: 'stretch',
					alignItems: 'center',
				}}
			>
				{assignment.assignmentTypeName && (
					<TouchableOpacity
						onPress={() => setShowHw(!showHw)}
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
					</TouchableOpacity>
				)}

				<Text
					style={{ alignSelf: 'center', width: '60%', margin: Spacings.s2 }}
					selectable
				>
					{showHw
						? `${assignment.assignmentTypeName}: ${assignment.assignmentName}`
						: '...'}
				</Text>

				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
							alignSelf: 'center',
						}}
						textStyle={{ fontSize: 16 }}
						subTextStyle={{ fontSize: 14, alignSelf: 'center' }}
					/>
				</View>

				{showHw &&
					((assignment.attachmentsExists && attachments.fallback) ||
						(attachment &&
							attachment.map(e => (
								<AttachmentFile attachment={e} key={e.attachmentId} />
							))))}
			</Surface>
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
