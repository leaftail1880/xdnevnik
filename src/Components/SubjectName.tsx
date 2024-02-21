import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { ColorValue, StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import { IconButton, Text, TextInput, TextProps } from 'react-native-paper'
import { Subject } from '../NetSchool/classes'
import { styles } from '../Setup/constants'
import { Settings } from '../Stores/Settings'
import { XDnevnik } from '../Stores/Xdnevnik.store'
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

	const overriden = Settings.forStudent(studentId).subjectNames[props.subjectId]

	if (overriden) return overriden

	return 'subjectName' in props
		? props.subjectName
		: props.subjects.find(subject => props.subjectId === subject.id)?.name ??
				'Предмет404'
}

type SubjectNameProps = {
	viewStyle?: StyleProp<ViewStyle>
	iconsSize?: number
} & SubjectNameOptions &
	Omit<
		TextProps<string>,
		'textAlign' | 'style' | 'selectionColor' | 'children'
	> & {
		style: Omit<TextStyle, 'color'> & { color?: ColorValue }
	}

export const SubjectName = observer(function SubjectName({
	viewStyle,
	...props
}: SubjectNameProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [newName, setNewName] = useState('')
	const { studentId } = XDnevnik

	if (!studentId) return <Loading />

	props.iconsSize ??= props.style.fontSize

	const name = getSubjectName(props)

	return (
		<View style={[styles.stretch, { margin: 0, padding: 0 }, viewStyle]}>
			{!isEditing ? (
				<Text {...props}>{name}</Text>
			) : (
				<TextInput
					{...props}
					defaultValue={name}
					onChangeText={setNewName}
					placeholder="Тот же, что и в сетевом городе"
				/>
			)}

			<View style={[styles.stretch, { padding: 0 }]}>
				<IconButton
					icon={isEditing ? 'content-save' : 'pencil'}
					size={props.iconsSize}
					style={props.style}
					onPress={() => {
						if (isEditing && newName) {
							runInAction(() => {
								const overrides = Settings.forStudent(studentId)
								overrides.subjectNames[props.subjectId] = newName
							})
						}
						setIsEditing(!isEditing)
					}}
				/>
				{isEditing && (
					<IconButton
						onPress={() => {
							setNewName('')
							setIsEditing(false)
						}}
						icon="undo"
						size={props.iconsSize}
						style={props.style}
					/>
				)}
			</View>
		</View>
	)
})
