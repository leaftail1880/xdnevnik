import { XSettings } from '@/models/settings'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { List, ListItemProps, Switch } from 'react-native-paper'

type SwitchSettingProps = Omit<ListItemProps, 'right' | 'onPress'> &
	(
		| {
				setting: keyof FilterObject<typeof XSettings, true | false>
		  }
		| {
				onChange(): void
				value: boolean
		  }
	)

export default observer(function SwitchSetting(props: SwitchSettingProps) {
	const onChange = useCallback(() => {
		if ('onChange' in props) {
			props.onChange()
		} else {
			XSettings.save({ [props.setting]: !XSettings[props.setting] })
		}
	}, [props])

	const value = 'setting' in props ? XSettings[props.setting] : props.value

	const right = useCallback(
		() => (
			<Switch value={value} onChange={onChange} disabled={props.disabled} />
		),
		[value, onChange, props.disabled],
	)

	return <List.Item {...props} onPress={onChange} right={right} />
})
