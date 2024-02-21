import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { TextInput } from 'react-native-paper'
import { Spacings } from '../../../../Components/Spacings'
import { Theme } from '../../../../Stores/Theme'

export const RoundnessSetting = observer(function RoundnessSetting() {
	const [error, setError] = useState(false)
	return (
		<TextInput
			keyboardType="numeric"
			label={'Округлость'}
			mode="outlined"
			defaultValue={Theme.roundness.toString()}
			error={error}
			style={{ margin: Spacings.s2 }}
			onChangeText={a =>
				runInAction(() => {
					const num = parseInt(a)
					if (isNaN(num)) {
						setError(true)
					} else {
						setError(false)
						Theme.roundness = num
						Theme.setColorScheme()
					}
				})
			}
		/>
	)
})
