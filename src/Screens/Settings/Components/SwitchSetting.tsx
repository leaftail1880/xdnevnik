import { observer } from 'mobx-react-lite'
import { Switch } from 'react-native-ui-lib'
import { l } from '../../../Setup/constants'
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
		l.warn(`SwutchSetting.setting type cannot be boolean!`)
		return false
	}
	return (
		<SettingsButton {...props}>
			<SettingsText>{props.label}</SettingsText>
			<Switch
				value={'setting' in props ? Settings[setting] : props.value}
				onValueChange={v => {
					if ('setting' in props) {
						Settings.save({ [setting]: v })
					} else props.onChange(v)
				}}
			/>
		</SettingsButton>
	)
})
