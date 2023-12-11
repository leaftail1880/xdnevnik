import { useContext, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors, Text, TextField, TextProps } from 'react-native-ui-lib'
import View from 'react-native-ui-lib/view'
import { Subject } from '../NetSchool/classes'
import { styles } from '../constants'
import { Ctx, SettingsCtx } from '../hooks/settings'
import { IconButton } from './Button'
import { Loading } from './Loading'

type SubjectNameOptions = {
	subjectId: number
} & (
	| {
			subjects: Subject[]
	  }
	| {
			subjectName: string
	  }
)

type GetSubjectNameOptions = {
	settings: SettingsCtx
	studentId: number
} & SubjectNameOptions

export function getSubjectName(props: GetSubjectNameOptions) {
	const overriden =
		props.settings.studentOverrides[props.studentId]?.subjectNames[
			props.subjectId
		]

	if (overriden) return overriden

	return 'subjectName' in props
		? props.subjectName
		: props.subjects.find(subject => props.subjectId === subject.id)?.name ??
				'Предмет404'
}

type SubjectNameProps = {
	viewStyle?: StyleProp<ViewStyle>
	iconsSize: number
} & SubjectNameOptions &
	Omit<TextProps, 'textAlign'>

export function SubjectName({ viewStyle, ...props }: SubjectNameProps) {
	const { settings, studentId } = useContext(Ctx)
	const [isEditing, setIsEditing] = useState(false)
	const [newName, setNewName] = useState('')

	if (!studentId) return <Loading />

	const name = getSubjectName({ ...props, settings, studentId })

	return (
		<View style={[styles.stretch, { margin: 0, padding: 0 }, viewStyle]}>
			{!isEditing ? (
				<Text {...props}>{name}</Text>
			) : (
				<TextField
					{...props}
					style={[
						props.style,
						{
							backgroundColor: Colors.rgba(Colors.grey10, 0.1),
						},
					]}
					defaultValue={name}
					onChangeText={setNewName}
					placeholder="Тот же, что и в сетевом городе"
				/>
			)}
			<IconButton
				padding-0
				marginL-s2
				icon={isEditing ? 'save-sharp' : 'pencil'}
				style={props.style}
				size={props.iconsSize}
				onPress={() => {
					if (isEditing) {
						settings.save({
							studentOverrides: {
								[studentId]: {
									subjectNames: {
										[props.subjectId]: newName ? newName : undefined,
									},
									subjects: settings.studentOverrides[studentId]?.subjects ?? {}
								},
							},
						})
					}
					setIsEditing(!isEditing)
				}}
			/>
			{isEditing && (
				<IconButton
					marginL-s2
					onPress={() => {
						setNewName('')
						setIsEditing(false)
					}}
					icon="arrow-undo"
					size={props.iconsSize}
					style={props.style}
				/>
			)}
		</View>
	)
}
