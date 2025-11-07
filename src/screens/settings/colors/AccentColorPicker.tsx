import { Theme } from '@/models/theme'
import { observer } from 'mobx-react-lite'
import { memo } from 'react'
import { View } from 'react-native'
import { Divider, List } from 'react-native-paper'
import ColorPicker, {
	HueSlider,
	Preview,
	Swatches,
} from 'reanimated-color-picker'

export default observer(function AccentColorPicker() {
	return (
		<List.Section title="Акценты">
			<List.Item title="Цвет акцентов"></List.Item>
			<ColorPicker
				style={{ width: '90%', alignSelf: 'center' }}
				value={Theme.manage.getAccentColor()}
				onComplete={color => Theme.manage.setAccentColor(color.hex)}
			>
				<ColorPickerPanel />
				<Swatches colors={Theme.manage.getAccentColors()} />
			</ColorPicker>
			<List.Item
				title={'Очистить использованные цвета'}
				onPress={Theme.manage.clearSelectedAccentColors}
				left={props => <List.Icon icon="delete" {...props}></List.Icon>}
			></List.Item>
		</List.Section>
	)
})
// eslint-disable-next-line mobx/missing-observer
const ColorPickerPanel = memo(function ColorPickerPanel() {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return [Preview, HueSlider].map((Element, i) => (
		<View key={i.toString()}>
			<Element />
			<Divider style={{ margin: 8 }} />
		</View>
	))
})
