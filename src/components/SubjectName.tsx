import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import {
	ColorValue,
	StyleProp,
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
import { styles } from '~constants'
import { Settings } from '~models/settings'
import { Subject } from '~services/net-school/entities'
import Loading from './Loading'

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
	iconsSize?: number
} & SubjectNameOptions &
	Omit<
		TextProps<string>,
		'textAlign' | 'style' | 'selectionColor' | 'children'
	> & {
		style?: Omit<TextStyle, 'color'> & { color?: ColorValue }
	}

export default observer(function SubjectName({
	viewStyle,
	...props
}: SubjectNameProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [newName, setNewName] = useState('')
	const { studentId } = Settings

	if (!studentId) return <Loading />

	props.iconsSize ??= props.style?.fontSize

	const name = getSubjectName(props)

	return (
		<TouchableOpacity
			style={[styles.stretch, { margin: 0, padding: 0 }, viewStyle]}
			onPress={() => setIsEditing(true)}
		>
			<Text {...props}>{name}</Text>
			{isEditing && (
				<Portal>
					<Dialog visible onDismiss={() => setIsEditing(false)}>
						<Dialog.Title>Изменить имя</Dialog.Title>
						<Dialog.Content style={{ gap: 10 }}>
							<Text>
								Имя в журнале:{' '}
								<Text style={{ fontWeight: 'bold' }}>{getRealName(props)}</Text>
							</Text>
							<TextInput
								mode="flat"
								defaultValue={name}
								onChangeText={setNewName}
								placeholder="Как в журнале"
							/>
						</Dialog.Content>
						<Dialog.Actions>
							<Button
								onPress={() => {
									setNewName('')
									setIsEditing(false)
								}}
								style={props.style}
							>
								Отмена
							</Button>
							<Button
								icon={'content-save'}
								style={props.style}
								onPress={() => {
									runInAction(() => {
										const overrides = Settings.forStudent(studentId)
										if (newName) {
											overrides.subjectNames[props.subjectId] = newName
										} else {
											delete overrides.subjectNames[props.subjectId]
										}
									})
									setIsEditing(false)
								}}
							>
								Сохранить
							</Button>
						</Dialog.Actions>
					</Dialog>
				</Portal>
			)}
		</TouchableOpacity>
	)
})

