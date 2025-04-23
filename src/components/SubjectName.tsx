import { StudentSettings, XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { Subject } from '@/services/net-school/entities'
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
	HelperText,
	Portal,
	Text,
	TextInput,
	TextProps,
} from 'react-native-paper'

type SubjectNameOptions = {
	subjectId: number
	dayNameId?: string
} & ({ subjects: Subject[] } | { subjectName: string })

export function getSubjectName(from: SubjectNameOptions) {
	const { studentId } = XSettings
	if (!studentId) return 'Загрузка'

	const studentSettings = XSettings.forStudent(studentId)
	if (from.dayNameId) {
		const dayOverriden = studentSettings.subjectNamesDay[from.dayNameId]

		if (dayOverriden) return dayOverriden
	}

	return getOverridenOrOfficalName(from, studentSettings)
}

export function getOverridenOrOfficalName(
	from: SubjectNameOptions,
	studentSettings: StudentSettings,
) {
	const overriden = studentSettings.subjectNames[from.subjectId]
	if (overriden) return overriden

	return getOfficalName(from)
}

function getOfficalName(props: SubjectNameOptions) {
	return 'subjectName' in props
		? props.subjectName
		: (props.subjects.find(subject => props.subjectId === subject.id)?.name ??
				'Предмет 404')
}

type SubjectNameProps = {
	viewStyle?: StyleProp<ViewStyle>
	editDisabled?: boolean
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
	editDisabled,
	...props
}: SubjectNameProps) {
	const [isEditing, setIsEditing] = useState(false)
	const name = getSubjectName(props)
	const onPress = useCallback(() => setIsEditing(true), [setIsEditing])

	return (
		<TouchableOpacity
			style={[styles.touchable, viewStyle]}
			onPress={editDisabled ? undefined : onPress}
		>
			<Text {...props}>{name}</Text>
			{isEditing && <EditSubjectName setIsEditing={setIsEditing} {...props} />}
		</TouchableOpacity>
	)
})

const EditSubjectName = observer(function EditSubjectName({
	setIsEditing,
	...props
}: { setIsEditing: (v: boolean) => void } & SubjectNameProps) {
	const studentSettings = XSettings.forStudentOrThrow()
	const dayOverriden = getSubjectName(props)
	const globalOverriden = getOverridenOrOfficalName(props, studentSettings)
	const [name, setName] = useState('')
	const onCancelPress = useCallback(() => {
		setName('')
		setIsEditing(false)
	}, [setName, setIsEditing])

	const onSavePress = useCallback(() => {
		runInAction(() => {
			if (name) studentSettings.subjectNames[props.subjectId] = name
			else delete studentSettings.subjectNames[props.subjectId]
		})
		setIsEditing(false)
	}, [setIsEditing, name, studentSettings.subjectNames, props.subjectId])

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
							{getOfficalName(props)}
						</Text>
					</Text>
					{dayOverriden !== globalOverriden && (
						<>
							<HelperText type="error">
								Имя уже перезаписано для конкретного дня и урока, а сейчас вы
								меняете имя глобально. Если вы хотите переименовать конкретный
								урок в конкретный день, долго зажмите на пустое место на
								карточке предмета
							</HelperText>
							<Text>Глобально: {globalOverriden}</Text>
							<Text>Для дня: {dayOverriden}</Text>
						</>
					)}
					<TextInput
						mode="outlined"
						defaultValue={getOverridenOrOfficalName(props, studentSettings)}
						onChangeText={setName}
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
