import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { Button, Text } from 'react-native-paper'
import {
	registerTranslation,
	ru,
	TimePickerModal,
} from 'react-native-paper-dates'
registerTranslation('ru', ru)

export const SelectTime = observer(function SelectTime({
	label,
	onSelect,
	value: time,
	mode = 'outlined',
}: {
	label: string
	value: HoursMinutes
	onSelect: React.Dispatch<HoursMinutes>
	mode?:
		| 'text'
		| 'outlined'
		| 'contained'
		| 'elevated'
		| 'contained-tonal'
		| undefined
}) {
	const [visible, setVisible] = useState(false)
	const onDismiss = useCallback(() => {
		setVisible(false)
	}, [setVisible])

	const onConfirm = useCallback(
		({ hours, minutes }: HoursMinutes) => {
			setVisible(false)
			onSelect({ hours, minutes })
		},
		[onSelect],
	)
	return (
		<>
			<Button onPress={() => setVisible(true)} uppercase={false} mode={mode}>
				{label}: <RenderHoursMinutes time={time} />
			</Button>
			<TimePickerModal
				visible={visible}
				onDismiss={onDismiss}
				locale="ru"
				onConfirm={onConfirm}
				hours={time.hours}
				minutes={time.minutes}
			/>
		</>
	)
})

export interface HoursMinutes {
	hours: number
	minutes: number
}

export const RenderHoursMinutes = observer(function RenderTime({
	time,
}: {
	time: HoursMinutes
}) {
	return (
		<Text style={{ fontWeight: 'bold' }}>
			{time.hours.toString().padStart(2, '0')}:
			{time.minutes.toString().padStart(2, '0')}
		</Text>
	)
})
