import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { List, ListItemProps, Switch } from 'react-native-paper'
import { Settings } from '../models/settings'

type SwitchSettingProps = Omit<ListItemProps, 'right' | 'onPress'> &
	(
		| {
				setting: keyof FilterObject<typeof Settings, true | false>
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
			Settings.save({ [props.setting]: !Settings[props.setting] })
		}
	}, [props])

	const value = 'setting' in props ? Settings[props.setting] : props.value

	const right = useCallback(
		() => <Switch value={value} onChange={onChange} />,
		[value, onChange],
	)

	return <List.Item {...props} onPress={onChange} right={right} />
})
