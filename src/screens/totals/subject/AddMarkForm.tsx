import Mark from '@/components/Mark'
import NumberInputSetting from '@/components/NumberInput'
import { globalStyles } from '@/constants'
import { XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import type { PartialAssignment } from '@/services/net-school/entities'
import { Spacings } from '@/utils/Spacings'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { View } from 'react-native'
import { Button } from 'react-native-paper'

export const AddMarkForm = observer(function AddMarkForm(props: {
	setCustomMarks: (p: PartialAssignment[]) => void
	customMarks: PartialAssignment[]
}) {
	Theme.key

	const student = XSettings.studentId
		? XSettings.forStudent(XSettings.studentId)
		: undefined

	const defaultWeight = student?.defaultMarkWeight ?? 0
	const [weight, setWeight] = useState(defaultWeight)

	const defaultMark = student?.defaultMark ?? 0
	const [mark, setMark] = useState(defaultMark)
	const [open, setOpen] = useState(false)
	const addMark = useCallback(() => {
		if (!open) return
		// Saving
		runInAction(() => {
			props.customMarks.push({
				custom: true,
				result: Number(mark),
				weight: Number(weight),
				comment: 'Кастомная',
				assignmentTypeName: 'ВОЗМОЖНАЯ',
			})
		})
	}, [open, mark, props, weight])

	const addCustomMarkAndToggleForm = useCallback(() => {
		addMark()
		setOpen(true)
	}, [addMark, setOpen])

	return (
		<View>
			<View style={globalStyles.stretch}>
				<View style={globalStyles.row}>
					<Button
						onPress={open ? addMark : addCustomMarkAndToggleForm}
						icon={open ? 'content-save' : 'plus'}
					>
						{open ? 'Добавить' : 'Добавить оценку'}
					</Button>

					{open && (
						<Button icon="minus" onPress={() => setOpen(false)}>
							Свернуть
						</Button>
					)}
				</View>
				{open && (
					<Mark
						weight={weight}
						mark={mark}
						duty={false}
						style={{ paddingHorizontal: Spacings.s2 }}
						onPress={addMark}
					/>
				)}
				{!open && !!props.customMarks.length && (
					<Button icon="delete" onPress={() => props.setCustomMarks([])}>
						Убрать все
					</Button>
				)}
			</View>
			{open && (
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
