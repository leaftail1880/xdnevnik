import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { View } from 'react-native'
import { Button, TextInput } from 'react-native-paper'
import { Spacings } from '../../../Components/Spacings'
import { styles } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme'

export const RoundnessSetting = observer(function RoundnessSetting() {
	const [error, setError] = useState(false)
	const [value, setValue] = useState(Theme.roundness.toString())
	return (
		<View style={styles.stretch}>
			<TextInput
				keyboardType="numeric"
				label={'Округлость'}
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
							Theme.roundness = num
							Theme.setColorScheme()
						}
					})
				}}
				style={{ margin: Spacings.s2, flex: 2 }}
			/>
			<Button
				onPress={() =>
					runInAction(
						() => ((Theme.roundness = 5), Theme.setColorScheme(), setValue('5'))
					)
				}
			>
				Сбросить...
			</Button>
		</View>
	)
})
