import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { Button, IconButton, Surface, TextInput } from 'react-native-paper'
import { Spacings } from '../../Components/Spacings'
import { styles } from '../../Setup/constants'
import { Theme } from '../../Stores/Theme'
import type { MarkInfo } from '../Totals'

export const AddMarkForm = observer(function AddMarkForm(props: {
	setCustomMarks: (p: Partial<MarkInfo>[]) => void
	customMarks: Partial<MarkInfo>[]
}) {
	Theme.key
	const [weight, setWeight] = useState('')
	const [mark, setMark] = useState('')
	const [addingCustomMark, setAddingCustomMark] = useState(false)
	const addCustomMark = useCallback(() => {
		if (addingCustomMark) {
			// Saving
			props.setCustomMarks(
				props.customMarks.concat({
					result: Number(mark),
					weight: Number(weight),
					comment: 'Кастомная',
					assignmentTypeName: 'ВОЗМОЖНАЯ',
				})
			)
		}
		setAddingCustomMark(!addingCustomMark)
	}, [addingCustomMark, mark, props, weight])

	return (
		<View style={{ padding: Spacings.s2 }}>
			<View style={styles.stretch}>
				<Button
					onPress={addCustomMark}
					icon={addingCustomMark ? 'content-save' : 'plus'}
				>
					{addingCustomMark ? 'Сохранить' : 'Добавить оценку'}
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
				<Surface
					elevation={2}
					style={{ borderRadius: Theme.roundness, padding: Spacings.s2 }}
				>
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
				</Surface>
			)}
		</View>
	)
})
