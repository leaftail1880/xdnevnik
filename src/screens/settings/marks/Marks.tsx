import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { ScrollView } from 'react-native'
import { HelperText, List } from 'react-native-paper'
import Mark from '~components/Mark'
import NumberInputSetting from '~components/NumberInput'
import { RoundedSurface } from '~components/RoundedSurface'
import SelectModal from '~components/SelectModal'
import SwitchSetting from '~components/SwitchSetting'
import {
	changeSettings,
	Settings,
	StudentSettings,
	StudentSettingsWithSave,
} from '~models/settings'
import { Spacings } from '~utils/Spacings'
import { SettingsRoutes } from '../navigation'

const markStyles = [
	{ label: 'Линия', value: 'border' as const },
	{ label: 'Фон', value: 'background' as const },
]

export default observer(function Notifications(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	props: StackScreenProps<SettingsRoutes>,
) {
	const student = Settings.studentId
		? Settings.forStudent(Settings.studentId)
		: undefined
	return (
		<ScrollView>
			<List.Section title="Общие">
				<SelectModal
					label="Стиль оценок"
					value={Settings.markStyle}
					data={markStyles}
					onSelect={({ value }) => Settings.save({ markStyle: value })}
				/>
				{/* <SwitchSetting
					title='"Вес: " перед весом оценки'
					setting="showMarkWeightTip"
				/> */}
			</List.Section>
			<List.Section title="Целевая оценка">
				{student && (
					<>
						<MarkInput
							label="Целевая оценка"
							description="Та оценка, к которой вы стремитесь. Будет использоваться при подсчете, сколько
						оценок нужно для достижения целевой оценки."
							markSetting="targetMark"
						/>

						<MarkInput
							label="Обычная оценка"
							description="Оценка, которую вы обычно получаете. Будет использоваться как оценка
						по умолчанию на экране добавления оценки и при подсчете, сколько
						оценок нужно для достижения целевой оценки."
							markSetting="defaultMark"
							weightSetting="defaultMarkWeight"
						/>
					</>
				)}
				<SwitchSetting
					title="Компактное отображение"
					description="Компактное отображение целевой оценки"
					setting="targetMarkCompact"
				/>
			</List.Section>
		</ScrollView>
	)
})
type StudentNumbers = FilterObject<StudentSettings, number | undefined>

interface MarkInputProps {
	markSetting: keyof StudentNumbers
	weightSetting?: keyof StudentNumbers
	label: string
	description: string
}

const MarkInput = observer(function MarkInput(props: MarkInputProps) {
	const [show, setShow] = useState(true)
	const toggleShow = useCallback(() => setShow(v => !v), [setShow])

	if (!Settings.studentId) return false
	const student = Settings.forStudent(Settings.studentId)

	const mark = student[props.markSetting] ?? 'Нет'
	const weight = props.weightSetting && student[props.weightSetting]
	return (
		<>
			<List.Item
				title={props.label}
				right={() => (
					<Mark
						mark={mark}
						weight={weight}
						duty={false}
						style={{ minHeight: 50, minWidth: 50 }}
						onPress={toggleShow}
					/>
				)}
			/>
			{show && <MarkInputForm {...props} student={student} />}
		</>
	)
})

type MarkInputPropsWithStudent = MarkInputProps & {
	student: StudentSettingsWithSave
}

const MarkInputForm = observer(function MarkInputForm(
	props: MarkInputPropsWithStudent,
) {
	return (
		<RoundedSurface elevation={1} style={{ marginBottom: Spacings.s3 }}>
			<NumberInputSetting
				label="Оценка"
				defaultValue={undefined}
				value={props.student[props.markSetting]}
				onChange={v =>
					changeSettings(props.student, { [props.markSetting]: v })
				}
			/>
			{props.weightSetting && (
				<NumberInputSetting
					label="Вес"
					defaultValue={undefined}
					value={props.student[props.weightSetting]}
					onChange={v =>
						changeSettings(props.student, { [props.weightSetting!]: v })
					}
				/>
			)}
			<HelperText type="info">{props.description}</HelperText>
		</RoundedSurface>
	)
})
