import { useCallback } from 'react'
import { Falsy } from 'react-native'
import { List, Switch } from 'react-native-paper'
import { Settings } from '../../../Stores/Settings'

type SwitchSettingProps = {
	/**
	 * Label that will be displayed in the right
	 */
	label?: string | React.JSX.Element | Falsy
} & (
	| {
			setting: keyof FilterObject<typeof Settings, true | false>
	  }
	| {
			onChange(): void
			value: boolean
	  }
)

// eslint-disable-next-line mobx/missing-observer
export const SwitchSetting = function SwitchSetting(props: SwitchSettingProps) {
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
		[value, onChange]
	)

	return <List.Item title={props.label} onPress={onChange} right={right} />
}
