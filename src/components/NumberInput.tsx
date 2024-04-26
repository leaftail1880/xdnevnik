import { runInAction } from 'mobx'
import { useState } from 'react'
import { View } from 'react-native'
import { Button, TextInput } from 'react-native-paper'
import { Spacings } from '../utils/Spacings'

type NumberInputSettingProps = {
	value: number
	defaultValue: number
	onChange: (value: number) => void
	label: string
}

// eslint-disable-next-line mobx/missing-observer
export default function NumberInputSetting(props: NumberInputSettingProps) {
	const [error, setError] = useState(false)
	const [value, setValue] = useState(props.value.toString())
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				alignContent: 'center',
			}}
		>
			<TextInput
				keyboardType="numeric"
				label={props.label}
				mode="outlined"
				value={value}
				error={error}
				onChangeText={text => {
					setValue(text)
				}}
				onBlur={() => {
					runInAction(() => {
						const num = parseInt(value)
						if (isNaN(num)) {
							setError(true)
						} else {
							setError(false)
							setValue(num + '')
							props.onChange(num)
						}
					})
				}}
				style={{ margin: Spacings.s2, flex: 2, maxWidth: '50%' }}
			/>
			<Button
				onPress={() =>
					runInAction(() => (props.onChange(props.defaultValue), setValue('5')))
				}
			>
				Сбросить...
			</Button>
		</View>
	)
}
