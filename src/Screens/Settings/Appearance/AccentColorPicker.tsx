import { observer } from 'mobx-react-lite'
import { memo } from 'react'
import { View } from 'react-native'
import { Button, Divider, Text } from 'react-native-paper'
import ColorPicker, {
	HueSlider,
	Preview,
	SaturationSlider,
	Swatches,
} from 'reanimated-color-picker'
import { Spacings } from '../../../Components/Spacings'
import { Theme, ThemeStore } from '../../../Stores/Theme'
import { RoundnessSetting } from './RoundnessSetting'

export const AccentColorPicker = observer(function AccentColorPicker() {
	const meta = ThemeStore.meta(Theme)
	return (
		<>
			<Divider style={{ marginBottom: Spacings.s2, margin: Spacings.s1 }} />
			<View>
				<RoundnessSetting />
				<Text variant="labelLarge" style={{ margin: Spacings.s2 }}>
					Цвет акцентов:
				</Text>
				<ColorPicker
					style={{ width: '90%', alignSelf: 'center' }}
					value={meta.accentColor}
					onComplete={color => Theme.setAccentColor(color.hex)}
				>
					<ColorPickerPanel />
					<Button
						icon="delete"
						style={{ margin: Spacings.s2 }}
						onPress={meta.clearAccentColors}
					>
						Очистить использованные цвета
					</Button>
					<Swatches colors={meta.accentColors} />
				</ColorPicker>
			</View>
		</>
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
