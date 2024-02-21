import { observer } from 'mobx-react-lite'
import { ScrollView, View } from 'react-native'
import { Button, Surface, Text } from 'react-native-paper'
import Toast from 'react-native-toast-message'
import { Spacings } from '../../../../Components/Spacings'
import { styles } from '../../../../Setup/constants'
import { Settings } from '../../../../Stores/Settings'
import { Theme } from '../../../../Stores/Theme'
import { DropdownSettingsButton } from '../../Components/DropdownSettingsButton'
import { SwitchSetting } from '../../Components/SwitchSetting'
import { AccentColorPicker } from './AccentColorPicker'

const themes = [
	{ name: 'Системная', i: 'system' as const },
	{ name: 'Темная', i: 'dark' as const },
	{ name: 'Светлая', i: 'light' as const },
]

const markStyles = [
	{ name: 'Линия', i: 'border' as const },
	{ name: 'Фон', i: 'background' as const },
]

export default observer(function Appearance() {
	Theme.key
	return (
		<ScrollView contentContainerStyle={{}}>
				<DropdownSettingsButton
					label={'Тема'}
					data={themes}
					defaultValueByIndex={themes.findIndex(e => e.i === Theme.scheme)}
					onSelect={s => Theme.setColorScheme(s.i)}
					selectionText={i => i?.name}
				/>

				<DropdownSettingsButton
					label="Стиль оценок"
					data={markStyles}
					defaultValueByIndex={markStyles.findIndex(
						e => e.i === Settings.markStyle
					)}
					onSelect={s => Settings.save({ markStyle: s.i })}
					selectionText={i => i?.name}
				/>
				<SwitchSetting setting="lastNameLast" label="Показывать ФИО как ИОФ" />
			<AccentColorPicker />
			{false && <DevSettings />}
		</ScrollView>
	)
})

const DevSettings = observer(function DevSettings() {
	return (
		<Surface elevation={1} style={{ borderRadius: Theme.roundness }}>
			<Button onPress={() => Toast.show({ text1: 'Проверка', text2: 'Тоста' })}>
				Проверить тост
			</Button>
			<Button
				onPress={() =>
					Toast.show({
						text1: 'Проверка',
						text2:
							'Тоста с обычно очень очень очень длинным текстом что аж жесть',
						type: 'error',
					})
				}
			>
				Проверить тост ошибку
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
