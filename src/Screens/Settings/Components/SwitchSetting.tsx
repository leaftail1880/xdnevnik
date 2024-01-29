import { observer } from 'mobx-react-lite'
import { Switch } from 'react-native-ui-lib'
import { Logger } from '../../../Setup/constants'
import { Settings } from '../../../Stores/Settings.store'
import { SettingsText } from './Base'
import { SettingsButton, SettingsButtonProps } from './SettingsButton'

type SwitchSettingProps = SettingsButtonProps &
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
		if (setting) {
			Settings.save({ [setting]: v })
			// @ts-expect-error Look at check above
		} else props.onChange(v)
	}
	return (
		<SettingsButton
			{...props}
			br10
			onPress={() => onChange(!Settings[setting])}
		>
			<SettingsText>{props.label}</SettingsText>
			<Switch
				value={'setting' in props ? Settings[setting] : props.value}
				onValueChange={onChange}
			/>
		</SettingsButton>
	)
})
