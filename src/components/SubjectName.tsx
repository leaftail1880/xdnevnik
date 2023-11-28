import { useContext, useState } from 'react'
import { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { Spacings, TextField, TextProps } from 'react-native-ui-lib'
import View from 'react-native-ui-lib/view'
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
	viewStyle?: StyleProp<ViewStyle>
} & SubjectNameOptions &
	Omit<TextProps, 'textAlign'>

export function SubjectName({ viewStyle, ...props }: SubjectNameProps) {
	const { settings } = useContext(Ctx)
	const name = getSubjectName({ ...props, settings })

	const [isEditing, setIsEditing] = useState(false)
	const [newName, setNewName] = useState('')

	return (
		<View style={[styles.stretch, { margin: 0, padding: 0 }, viewStyle]}>
			{!isEditing ? (
				<Text {...props}>{name}</Text>
			) : (
				<TextField
					{...props}
					defaultValue={name}
					onChangeText={setNewName}
					placeholder="Тот же, что и в сетевом городе"
				/>
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
				<IconA name={isEditing ? 'save-sharp' : 'pencil'} style={props.style} />
			</Button>
			{isEditing && (
				<Button
					onPress={() => {
						setNewName('')
						setIsEditing(false)
					}}
				>
					<IconA name="arrow-undo" style={props.style} />
				</Button>
			)}
		</View>
	)

	function IconA(props: { name: string; style: StyleProp<TextStyle> }) {
		return (
			<Ionicon
				name={props.name}
				style={[
					{ paddingLeft: Spacings.s2, margin: 0, padding: 0 },
					props.style,
				]}
			/>
		)
	}
}
