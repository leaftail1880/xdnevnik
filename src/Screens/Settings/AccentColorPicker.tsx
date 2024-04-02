import { observer } from 'mobx-react-lite'
import { memo } from 'react'
import { View } from 'react-native'
import { Divider, List } from 'react-native-paper'
import ColorPicker, {
	HueSlider,
	Preview,
	SaturationSlider,
	Swatches,
} from 'reanimated-color-picker'
import { Theme, ThemeStore } from '../../Stores/Theme'

export default observer(function AccentColorPicker() {
	const meta = ThemeStore.meta(Theme)
	return (
		<List.Section title="Акценты">
			<List.Item title="Цвет акцентов"></List.Item>
			<ColorPicker
				style={{ width: '90%', alignSelf: 'center' }}
				value={meta.accentColor}
				onComplete={color => Theme.setAccentColor(color.hex)}
			>
				<ColorPickerPanel />
				<Swatches colors={meta.accentColors} />
			</ColorPicker>
			<List.Item
				title={'Очистить использованные цвета'}
				onPress={meta.clearAccentColors}
				left={props => <List.Icon icon="delete" {...props}></List.Icon>}
			></List.Item>
		</List.Section>
	)
})
// eslint-disable-next-line mobx/missing-observer
const ColorPickerPanel = memo(function ColorPickerPanel() {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return [Preview, HueSlider, SaturationSlider].map((Element, i) => (
		<View key={i.toString()}>
			<Element />
			<Divider style={{ margin: 8 }} />
		</View>
	))
})
