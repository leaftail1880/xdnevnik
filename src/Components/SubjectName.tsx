import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors, Text, TextField, TextProps } from 'react-native-ui-lib'
import View from 'react-native-ui-lib/view'
import { Subject } from '../NetSchool/classes'
import { styles } from '../Setup/constants'
import { Settings } from '../Stores/Settings.store'
import { XDnevnik } from '../Stores/Xdnevnik.store'
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

export function getSubjectName(props: SubjectNameOptions) {
	const { studentId } = XDnevnik
	if (!studentId) return 'Загрузка'

	const overriden =
		Settings.studentOverrides[studentId]?.subjectNames[props.subjectId]

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

export const SubjectName = observer(function SubjectName({
	viewStyle,
	...props
}: SubjectNameProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [newName, setNewName] = useState('')
	const { studentId } = XDnevnik

	if (!studentId) return <Loading />

	const name = getSubjectName(props)

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
						runInAction(() => {
							Settings.studentOverrides[studentId] ??= {
								subjectNames: {},
								subjects: {},
							}
							Settings.studentOverrides[studentId]!.subjectNames[
								props.subjectId
							] = newName ? newName : undefined
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
})
