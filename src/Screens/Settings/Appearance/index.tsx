import { observer } from 'mobx-react-lite'
import { ScrollView, View } from 'react-native'
import { Button, Divider, Surface, Text } from 'react-native-paper'
import Toast from 'react-native-toast-message'
import { Spacings } from '../../../Components/Spacings'
import { styles } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme'
import { SegmentedSettingsButton } from '../Components/SegmentedSettingsButton'
import { AccentColorPicker } from './AccentColorPicker'

const themes = [
	{ label: 'Системная', value: 'system' as const },
	{ label: 'Темная', value: 'dark' as const },
	{ label: 'Светлая', value: 'light' as const },
]

const markStyles = [
	{ label: 'Линия', value: 'border' as const },
	{ label: 'Фон', value: 'background' as const },
]

export default observer(function Appearance() {
	Theme.key
	return (
		<ScrollView>
			<SegmentedSettingsButton
				label="Тема"
				source={Theme}
				setting="scheme"
				values={themes}
			/>

			<SegmentedSettingsButton
				label="Стиль оценок"
				setting="markStyle"
				values={markStyles}
			/>

			<SegmentedSettingsButton
				setting="nameFormat"
				label="В каком порядке отображать Фамилию Имя Отчество"
				values={[
					{ label: 'ФИО', value: 'fio' },
					{ label: 'ИФО', value: 'ifo' },
				]}
			/>
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
