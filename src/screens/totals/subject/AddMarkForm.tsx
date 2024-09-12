import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { Button, IconButton, TextInput } from 'react-native-paper'
import { Theme } from '~models/theme'
import type { PartialAssignment } from '~services/net-school/entities'
import { styles } from '../../../constants'
import { Spacings } from '../../../utils/Spacings'

export const AddMarkForm = observer(function AddMarkForm(props: {
	setCustomMarks: (p: Partial<PartialAssignment>[]) => void
	customMarks: Partial<PartialAssignment>[]
}) {
	Theme.key
	const [weight, setWeight] = useState('')
	const [mark, setMark] = useState('')
	const [addingCustomMark, setAddingCustomMark] = useState(false)
	const addCustomMark = useCallback(() => {
		if (addingCustomMark) {
			// Saving
			props.setCustomMarks([
				...props.customMarks,
				{
					result: Number(mark),
					weight: Number(weight),
					comment: 'Кастомная',
					assignmentTypeName: 'ВОЗМОЖНАЯ',
				},
			])
		}
		setAddingCustomMark(!addingCustomMark)
	}, [addingCustomMark, mark, props, weight])

	return (
		<View>
			<View style={styles.stretch}>
				<Button
					onPress={addCustomMark}
					icon={addingCustomMark ? 'content-save' : 'plus'}
				>
					{addingCustomMark ? 'Добавить' : 'Добавить оценку'}
				</Button>
				{addingCustomMark && (
					<IconButton
						icon="undo"
						onPress={() => {
							setAddingCustomMark(false)
						}}
					/>
				)}
				{!addingCustomMark && !!props.customMarks.length && (
					<IconButton
						icon="delete"
						onPress={() => {
							props.setCustomMarks([])
						}}
					/>
				)}
			</View>
			{addingCustomMark && (
				<View style={{ padding: Spacings.s1 }}>
					<TextInput
						mode="outlined"
						style={{ marginBottom: Spacings.s2 }}
						placeholder="Оценка"
						defaultValue={mark}
						keyboardType="numeric"
						onChangeText={setMark}
					/>
					<TextInput
						mode="outlined"
						placeholder="Вес"
						defaultValue={weight}
						keyboardType="numeric"
						onChangeText={setWeight}
					/>
				</View>
			)}
		</View>
	)
})
