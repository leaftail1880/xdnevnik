import { observer } from 'mobx-react-lite'
import { useState } from 'react'
// import { SafeAreaView } from 'react-native-safe-area-context'
import {
	Colors,
	Text,
	TextField,
	TextFieldProps,
	View,
} from 'react-native-ui-lib'
import {
	Button,
	IconButton,
	IconButtonProps,
	buttonStyle,
} from '../../Components/Button'
import { Ionicon } from '../../Components/Icon'
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

	const textFieldProps = {
		'br20': true,
		'margin-s2': true,
		'text70': true,
		'floatingPlaceholder': true,
		'keyboardType': 'numeric',
	} satisfies TextFieldProps

	const iconProps = {
		'marginL-s2': true,
		'iconColor': Colors.$textAccent,
		'style': buttonStyle(),
		'size': 26,
	} as Omit<IconButtonProps, 'icon'>

	return (
		<View padding-s2>
			<View flex row centerV padding-s2>
				<Button
					center
					br20
					onPress={() => {
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
					}}
				>
					<View flex row spread centerV padding-s1>
						<Ionicon
							name={addingCustomMark ? 'save-sharp' : 'add'}
							size={18}
							color={Colors.$textAccent}
						></Ionicon>
						<Text marginL-s1 $textAccent>
							{addingCustomMark ? 'Сохранить' : 'Добавить оценку'}
						</Text>
					</View>
				</Button>
				{addingCustomMark && (
					<IconButton
						{...iconProps}
						icon="arrow-undo"
						onPress={() => {
							setAddingCustomMark(false)
						}}
					/>
				)}
				{!addingCustomMark && !!props.customMarks.length && (
					<IconButton
						{...iconProps}
						icon="trash"
						onPress={() => {
							props.setCustomMarks([])
						}}
					/>
				)}
			</View>
			{addingCustomMark && (
				<View padding-s4 backgroundColor={Colors.$backgroundPrimaryMedium} br30>
					<View flex row spread>
						<TextField
							{...textFieldProps}
							placeholder="Оценка"
							onChangeText={setMark}
						/>
						{/* <SafeAreaView>
							<WheelPicker
								items={new Array(5)
									.fill({})
									.map((_, i) => ({ label: i + '', value: i }))}
							/>
						</SafeAreaView> */}
					</View>
					<TextField
						{...textFieldProps}
						placeholder="Вес"
						onChangeText={setWeight}
					/>
				</View>
			)}
		</View>
	)
})
