import { useContext, useState } from 'react'
import { StyleProp, TextInput, TextStyle, ViewStyle } from 'react-native'
import { View } from 'react-native-ui-lib'
import { Subject } from '../NetSchool/classes'
import { styles } from '../constants'
import { Ctx, SettingsCtx } from '../hooks/settings'
import { Button } from './Button'
import { Ionicon } from './Icon'
import { Text } from './Text'

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
} & SubjectNameOptions

export function getSubjectName(props: GetSubjectNameOptions) {
	const overriden = props.settings.overrides.subjectNames[props.subjectId]

	if (overriden) return overriden

	return 'subjectName' in props
		? props.subjectName
		: props.subjects.find(subject => props.subjectId === subject.id)?.name ??
				'Предмет404'
}

type SubjectNameProps = {
	style?: StyleProp<TextStyle>
	viewStyle?: StyleProp<ViewStyle>
} & SubjectNameOptions

export function SubjectName(props: SubjectNameProps) {
	const { settings } = useContext(Ctx)
	const name = getSubjectName({ ...props, settings })

	const [isEditing, setIsEditing] = useState(false)
	const [newName, setNewName] = useState('')

	return (
		<View style={[styles.stretch, { margin: 0, padding: 0 }, props.viewStyle]}>
			{!isEditing ? (
				<Text style={props.style}>{name}</Text>
			) : (
				<TextInput
					style={props.style}
					defaultValue={name}
					onChangeText={setNewName}
					placeholder="Тот же, что и в сетевом городе"
				></TextInput>
			)}
			<Button
				padding-0
				onPress={() => {
					if (isEditing) {
						settings.save({
							overrides: {
								subjectNames: {
									[props.subjectId]: newName ? newName : undefined,
								},
							},
						})
					}
					setIsEditing(!isEditing)
				}}
			>
				<Ionicon
					name={!isEditing ? 'pencil' : 'save-sharp'}
					style={[{ paddingLeft: 7 }, props.style]}
				/>
			</Button>
			{isEditing && (
				<Button
					onPress={() => {
						setNewName('')
						setIsEditing(false)
					}}
				>
					<Ionicon
						name="arrow-undo"
						style={[{ paddingLeft: 7 }, props.style]}
					/>
				</Button>
			)}
		</View>
	)
}
