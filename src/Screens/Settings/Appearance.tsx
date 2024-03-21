import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { memo } from "react"
import { Appearance, ColorSchemeName, ScrollView, View } from 'react-native'
import { Button, Divider, List, Surface, Text } from 'react-native-paper'
import ColorPicker, {
	HueSlider,
	Preview,
	SaturationSlider,
	Swatches,
} from 'reanimated-color-picker'
import { ModalAlert, Toast } from '../../Components/Modal'
import SelectModal from '../../Components/SelectModal'
import { styles } from '../../Setup/constants'
import { Settings } from '../../Stores/Settings'
import { Theme, ThemeStore } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'
import NumberInputSetting from './Components/NumberInput'
import { SwitchSetting } from './Components/SwitchSetting'

const themes = [
	{ label: 'Системная', value: 'system' as const },
	{ label: 'Темная', value: 'dark' as const },
	{ label: 'Светлая', value: 'light' as const },
]

const toThemes = (theme: ColorSchemeName) => (theme === null ? 'system' : theme)
const toAppearance = (theme: 'dark' | 'light' | 'system') =>
	theme === 'system' ? null : theme

const markStyles = [
	{ label: 'Линия', value: 'border' as const },
	{ label: 'Фон', value: 'background' as const },
]

const nameFormat = [
	{ label: 'ФИО', value: 'fio' as const },
	{ label: 'ИФО', value: 'ifo' as const },
]

export default observer(function AppearanceSettings() {
	Theme.key

	return (
		<ScrollView>
			<List.Section title="Общие">
				<SelectModal
					label="Тема"
					data={themes}
					value={toThemes(Appearance.getColorScheme())}
					onSelect={({ value }) =>
						Appearance.setColorScheme(toAppearance(value))
					}
				/>

				<SelectModal
					label="Порядок Фамилии Имени Отчества"
					value={Settings.nameFormat}
					data={nameFormat}
					onSelect={({ value }) => Settings.save({ nameFormat: value })}
				/>

				<NumberInputSetting
					label="Округлость"
					value={Theme.roundness}
					defaultValue={5}
					onChange={value =>
						runInAction(() => {
							Theme.roundness = value
							ThemeStore.meta(Theme).updateColorScheme()
						})
					}
				/>
			</List.Section>
			<Divider style={{ margin: Spacings.s1 }} />
			<List.Section title="Оценки">
				<SelectModal
					label="Стиль оценок"
					value={Settings.markStyle}
					data={markStyles}
					onSelect={({ value }) => Settings.save({ markStyle: value })}
				/>
				<SwitchSetting
					label='"Вес: " перед весом оценки'
					setting="showMarkWeightTip"
				/>
			</List.Section>
			<Divider style={{ margin: Spacings.s1 }} />

			<AccentColorPicker />
			<Divider style={{ margin: Spacings.s1 }} />
			{/* {__DEV__ && <DevSettings />} */}
		</ScrollView>
	)
})


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DevSettings = observer(function DevSettings() {
	return (
		<Surface elevation={1} style={{ borderRadius: Theme.roundness }}>
			<Button onPress={() => Toast.show({ title: 'Проверка', timeout: 10000 })}>
				Проверить тост
			</Button>
			<Button
				onPress={() =>
					Toast.show({
						title: 'Проверка',
						body: 'Тоста с обычно очень очень очень длинным текстом что аж жесть',
						error: true,
					})
				}
			>
				Проверить тост ошибку
			</Button>
			<Button onPress={() => ModalAlert.show('Проверка')}>
				Проверить модал
			</Button>
			<Button
				onPress={() =>
					ModalAlert.show(
						'Проверка',
						'Тоста с обычно очень очень очень длинным текстом что аж жесть',
						true
					)
				}
			>
				Проверить модал ошибку
			</Button>
			<ThemePreview />
		</Surface>
	)
})

const ThemePreview = observer(function ThemePreview() {
	return (
		<View key={Theme.key}>
			{Object.entries(Theme.colors)
				.sort((a, b) => a[0].localeCompare(b[0]))
				.map(([key, value]) => {
					if (typeof value === 'string')
						return (
							<View
								style={[
									styles.stretch,
									{
										padding: 0,
										paddingHorizontal: Spacings.s1,
										margin: 0,
									},
								]}
								key={key}
							>
								<Text>{key}</Text>
								<View
									style={{
										backgroundColor: value,
										padding: Spacings.s3,
										width: '30%',
										margin: 0,
									}}
								></View>
							</View>
						)
				})
				.filter(Boolean)}
		</View>
	)
})

const AccentColorPicker = observer(function AccentColorPicker() {
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

