import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Switch, Text, TouchableRipple } from 'react-native-paper'
import { Spacings } from '../../../Components/Spacings'
import { Logger, styles } from '../../../Setup/constants'
import { Settings } from '../../../Stores/Settings'
import { BaseSetting } from './Base'

type SwitchSettingProps = BaseSetting &
	(
		| {
				setting: keyof FilterObject<typeof Settings, true | false>
		  }
		| {
				onChange(v: boolean): void
				value: boolean
		  }
	)

export const SwitchSetting = observer(function SwitchSetting(
	props: SwitchSettingProps
) {
	const setting = 'setting' in props && props.setting
	if (typeof setting === 'boolean') {
		Logger.warn(`SwutchSetting.setting type cannot be boolean!`)
		return false
	}
	const onChange = (v: boolean): void => {
		if ('onChange' in props) {
			props.onChange(v)
		} else {
			Settings.save({ [setting]: v })
		}
	}
	return (
		<TouchableRipple {...props} onPress={() => onChange(!Settings[setting])}>
			<View
				style={[
					styles.stretch,
					{
						width: '100%',
						padding: Spacings.s2,
						margin: Spacings.s1,
					},
				]}
			>
				<Text variant="labelLarge">{props.label}</Text>
				<Switch
					value={'setting' in props ? Settings[setting] : props.value}
					onValueChange={onChange}
				/>
			</View>
		</TouchableRipple>
	)
})
