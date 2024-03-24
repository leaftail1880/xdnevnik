import { Observer } from 'mobx-react-lite'
import { List, Switch } from 'react-native-paper'
import { Settings } from '../../../Stores/Settings'
import { Falsy } from 'react-native'

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
	const onChange = () => {
		if ('onChange' in props) {
			props.onChange()
		} else {
			Settings.save({ [props.setting]: !Settings[props.setting] })
		}
	}

	return (
		<>
			<List.Item
				title={props.label}
				onPress={onChange}
				right={() => (
					<Observer>
						{
							// eslint-disable-next-line mobx/missing-observer
							function SwitchInternal() {
								return (
									<Switch
										value={
											'setting' in props ? Settings[props.setting] : props.value
										}
										onChange={onChange}
									/>
								)
							}
						}
					</Observer>
				)}
			/>
		</>
	)
}
