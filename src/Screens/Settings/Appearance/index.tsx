import { observer } from 'mobx-react-lite'
import { ScrollView, View } from 'react-native'
import { Button, Divider, List, Surface, Text } from 'react-native-paper'
import SelectModal from '../../../Components/SelectModal'
import { Toast } from '../../../Components/Toast'
import { styles } from '../../../Setup/constants'
import { Settings } from '../../../Stores/Settings'
import { Theme, ThemeStore } from '../../../Stores/Theme'
import { Spacings } from '../../../utils/Spacings'
import { AccentColorPicker } from './AccentColorPicker'
import { RoundnessSetting } from './RoundnessSetting'

const themes = [
	{ label: 'Системная', value: 'system' as const },
	{ label: 'Темная', value: 'dark' as const },
	{ label: 'Светлая', value: 'light' as const },
]

const markStyles = [
	{ label: 'Линия', value: 'border' as const },
	{ label: 'Фон', value: 'background' as const },
]

const nameFormat = [
	{ label: 'ФИО', value: 'fio' as const },
	{ label: 'ИФО', value: 'ifo' as const },
]

export default observer(function Appearance() {
	Theme.key

	return (
		<ScrollView>
			<List.Section title="Общие">
				<SelectModal
					label="Тема"
					value={ThemeStore.meta(Theme).scheme}
					data={themes}
					onSelect={({ value }) => Theme.setColorScheme(value)}
				/>

				<SelectModal
					label="Стиль оценок"
					value={Settings.markStyle}
					data={markStyles}
					onSelect={({ value }) => Settings.save({ markStyle: value })}
				/>

				<SelectModal
					label="Порядок Фамилии Имени Отчества"
					value={Settings.nameFormat}
					data={nameFormat}
					onSelect={({ value }) => Settings.save({ nameFormat: value })}
				/>

				<RoundnessSetting />
			</List.Section>
			<Divider style={{ margin: Spacings.s1 }} />

			<AccentColorPicker />
			<Divider style={{ margin: Spacings.s1 }} />
			{__DEV__ && <DevSettings />}
		</ScrollView>
	)
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DevSettings = observer(function DevSettings() {
	return (
		<Surface elevation={1} style={{ borderRadius: Theme.roundness }}>
			<Button onPress={() => Toast.show({ title: 'Проверка', body: 'Тоста' })}>
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
