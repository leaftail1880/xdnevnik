import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import {
	ColorValue,
	StyleProp,
	StyleSheet,
	TextStyle,
	TouchableOpacity,
	ViewStyle,
} from 'react-native'
import {
	Button,
	Dialog,
	Portal,
	Text,
	TextInput,
	TextProps,
} from 'react-native-paper'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { Subject } from '~services/net-school/entities'

type SubjectNameOptions = {
	subjectId: number
} & ({ subjects: Subject[] } | { subjectName: string })

export function getSubjectName(from: SubjectNameOptions) {
	const { studentId } = Settings
	if (!studentId) return 'Загрузка'

	const overriden = Settings.forStudent(studentId).subjectNames[from.subjectId]
	if (overriden) return overriden

	return getRealName(from)
}

function getRealName(props: SubjectNameOptions) {
	return 'subjectName' in props
		? props.subjectName
		: props.subjects.find(subject => props.subjectId === subject.id)?.name ??
				'Предмет 404'
}

type SubjectNameProps = {
	viewStyle?: StyleProp<ViewStyle>
} & SubjectNameOptions &
	Omit<
		TextProps<string>,
		'textAlign' | 'style' | 'selectionColor' | 'children'
	> & {
		style?: Omit<TextStyle, 'color'> & { color?: ColorValue }
	}

const styles = StyleSheet.create({
	touchable: { margin: 0, padding: 0 },
})

export default observer(function SubjectName({
	viewStyle,
	...props
}: SubjectNameProps) {
	const [isEditing, setIsEditing] = useState(false)
	const name = getSubjectName(props)
	const onPress = useCallback(() => setIsEditing(true), [setIsEditing])

	return (
		<TouchableOpacity style={[styles.touchable, viewStyle]} onPress={onPress}>
			<Text {...props}>{name}</Text>
			{isEditing && (
				<EditSubjectName setIsEditing={setIsEditing} name={name} {...props} />
			)}
		</TouchableOpacity>
	)
})

const EditSubjectName = observer(function EditSubjectName({
	setIsEditing,
	name,
	...props
}: { name: string; setIsEditing: (v: boolean) => void } & SubjectNameProps) {
	const [newName, setNewName] = useState('')
	const onCancelPress = useCallback(() => {
		setNewName('')
		setIsEditing(false)
	}, [setNewName, setIsEditing])

	const onSavePress = useCallback(() => {
		runInAction(() => {
			const studentSettings = Settings.forStudentOrThrow()
			if (newName) {
				studentSettings.subjectNames[props.subjectId] = newName
			} else {
				delete studentSettings.subjectNames[props.subjectId]
			}
		})
		setIsEditing(false)
	}, [newName, setIsEditing, props.subjectId])

	return (
		<Portal>
			<Dialog visible onDismiss={() => setIsEditing(false)}>
				<Dialog.Title style={Theme.fonts.titleMedium}>
					Изменить имя
				</Dialog.Title>
				<Dialog.Content style={{ gap: 10 }}>
					<Text>
						Имя в журнале:{' '}
						<Text style={{ fontWeight: 'bold' }} selectable>
							{getRealName(props)}
						</Text>
					</Text>
					<TextInput
						mode="outlined"
						defaultValue={name}
						onChangeText={setNewName}
						placeholder="Как в журнале"
					/>
				</Dialog.Content>
				<Dialog.Actions>
					<Button icon="cancel" onPress={onCancelPress} style={props.style}>
						Отмена
					</Button>
					<Button
						icon={'content-save'}
						style={props.style}
						onPress={onSavePress}
					>
						Сохранить
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	)
})