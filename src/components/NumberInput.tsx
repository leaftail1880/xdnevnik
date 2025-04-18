import { runInAction } from 'mobx'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, HelperText, IconButton, TextInput } from 'react-native-paper'
import { Spacings } from '../utils/Spacings'

interface NumberInputSettingProps<T extends number | undefined = number> {
	value: T
	defaultValue: T
	onChange: (value: T) => void
	label: string
	description?: string
}

// eslint-disable-next-line mobx/missing-observer
export default function NumberInputSetting<
	T extends number | undefined = number,
>(props: NumberInputSettingProps<T>) {
	const [error, setError] = useState(false)
	const [value, setValue] = useState<string | undefined>(
		props.value?.toString(),
	)

	return (
		<>
			<View style={styles.view}>
				<TextInput
					keyboardType="numeric"
					label={props.label}
					mode="outlined"
					value={value}
					error={error}
					onChangeText={setValue}
					onBlur={() => {
						runInAction(() => {
							if (typeof value === 'undefined' || value === '') {
								if (typeof props.defaultValue === 'undefined') {
									setError(false)
									setValue(value)
									return props.onChange(value as T)
								} else return setError(true)
							}

							const num = parseInt(value)
							if (isNaN(num)) {
								setError(true)
							} else {
								setError(false)
								setValue(num + '')
								props.onChange(num as T)
							}
						})
					}}
					style={styles.textInput}
				/>
				<FastChange
					{...props}
					modifier={-1}
					setValue={setValue}
					value={value}
					icon="minus"
				/>
				<FastChange
					{...props}
					modifier={+1}
					setValue={setValue}
					value={value}
					icon="plus"
				/>

				<Button
					onPress={() =>
						runInAction(
							() => (
								props.onChange(props.defaultValue),
								setValue(props.defaultValue?.toString() ?? '')
							),
						)
					}
				>
					Сбросить...
				</Button>
			</View>

			{props.description && (
				<HelperText type="info">{props.description}</HelperText>
			)}
		</>
	)
}

// eslint-disable-next-line mobx/missing-observer
function FastChange(
	props: Omit<NumberInputSettingProps<number | undefined>, 'value'> & {
		value: string | undefined
		setValue: React.Dispatch<string | undefined>
		modifier: number
		icon: string
	},
) {
	return (
		<IconButton
			icon={props.icon}
			onPress={() => {
				const num = props.value
					? parseInt(props.value)
					: (props.defaultValue ?? 0)
				const changed = num + props.modifier
				runInAction(
					() => (props.onChange(changed), props.setValue(changed.toString())),
				)
			}}
		/>
	)
}

const styles = StyleSheet.create({
	view: {
		flexDirection: 'row',
		alignItems: 'center',
		alignContent: 'center',
	},
	textInput: { margin: Spacings.s2, flex: 2, maxWidth: '50%' },
})
