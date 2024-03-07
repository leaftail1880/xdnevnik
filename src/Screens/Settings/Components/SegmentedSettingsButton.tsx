import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import {
	Divider,
	SegmentedButtons,
	SegmentedButtonsProps,
	Text,
} from 'react-native-paper'
import { Spacings } from '../../../Components/Spacings'
import { Settings } from '../../../Stores/Settings'
import { ThemeStore } from '../../../Stores/Theme'

export const SegmentedSettingsButton = observer(
	function SegnemntedSettingsButton<
		Source extends typeof Settings | ThemeStore = typeof Settings,
		Key extends keyof FilterObject<Source, string> = keyof FilterObject<
			Source,
			string
		>,
		Value extends FilterObject<Source, string>[Key] = FilterObject<
			Source,
			string
		>[Key]
	>(props: {
		source?: Source
		values: (Omit<SegmentedButtonsProps['buttons'][number], 'value'> & {
			value: Value
		})[]
		setting: Key
		label: string
	}) {
		const source = (props.source ?? Settings) as unknown as Record<Key, string>
		return (
			<>
				<Text
					variant="labelMedium"
					style={{ alignSelf: 'center', margin: Spacings.s1 }}
				>
					{props.label}
				</Text>
				<SegmentedButtons
					style={{ width: '90%', alignSelf: 'center' }}
					value={source[props.setting]}
					// @ts-expect-error Idk
					buttons={props.values}
					onValueChange={value =>
						runInAction(() => {
							source[props.setting] = value
						})
					}
				/>
				<Divider style={{ margin: Spacings.s2 }} />
			</>
		)
	}
)
