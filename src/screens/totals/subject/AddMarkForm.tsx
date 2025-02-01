import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { Button, IconButton } from 'react-native-paper'
import Mark from '~components/Mark'
import NumberInputSetting from '~components/NumberInput'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import type { PartialAssignment } from '~services/net-school/entities'
import { Spacings } from '~utils/Spacings'
import { styles } from '../../../constants'

export const AddMarkForm = observer(function AddMarkForm(props: {
	setCustomMarks: (p: PartialAssignment[]) => void
	customMarks: PartialAssignment[]
}) {
	Theme.key

	const student = Settings.studentId
		? Settings.forStudent(Settings.studentId)
		: undefined

	const defaultWeight = student?.defaultMarkWeight ?? 0
	const [weight, setWeight] = useState(defaultWeight)

	const defaultMark = student?.defaultMark ?? 0
	const [mark, setMark] = useState(defaultMark)
	const [addingCustomMark, setAddingCustomMark] = useState(false)
	const addCustomMark = useCallback(() => {
		if (addingCustomMark) {
			// Saving
			props.setCustomMarks([
				...props.customMarks,
				{
					custom: true,
					result: Number(mark),
					weight: Number(weight),
					comment: 'Кастомная',
					assignmentTypeName: 'ВОЗМОЖНАЯ',
				},
			])
		}
	}, [addingCustomMark, mark, props, weight])

	const addCustomMarkAndCloseForm = useCallback(() => {
		addCustomMark()
		setAddingCustomMark(v => !v)
	}, [addCustomMark, setAddingCustomMark])

	return (
		<View>
			<View style={styles.stretch}>
				<Button
					onPress={addCustomMarkAndCloseForm}
					icon={addingCustomMark ? 'content-save' : 'plus'}
				>
					{addingCustomMark ? 'Добавить' : 'Добавить оценку'}
				</Button>
				{addingCustomMark && (
					<Mark
						weight={weight}
						mark={mark}
						duty={false}
						style={{ padding: Spacings.s1, paddingHorizontal: Spacings.s2 }}
						onPress={addCustomMark}
					/>
				)}

				{addingCustomMark && (
					<IconButton icon="minus" onPress={() => setAddingCustomMark(false)} />
				)}
				{!addingCustomMark && !!props.customMarks.length && (
					<IconButton icon="delete" onPress={() => props.setCustomMarks([])} />
				)}
			</View>
			{addingCustomMark && (
				<View>
					<NumberInputSetting<number>
						value={mark}
						defaultValue={defaultMark}
						onChange={setMark}
						label="Оценка"
					/>
					<NumberInputSetting<number>
						value={weight}
						defaultValue={defaultWeight}
						onChange={setWeight}
						label="Вес"
					/>
				</View>
			)}
		</View>
	)
})
