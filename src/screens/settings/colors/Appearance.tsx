import Loading from '@/components/Loading'
import NumberInputSetting from '@/components/NumberInput'
import SelectModal from '@/components/SelectModal'
import SwitchSetting from '@/components/SwitchSetting'
import { Settings } from '@/models/settings'
import { Theme, ThemeStore } from '@/models/theme'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { Suspense, lazy } from 'react'
import { Appearance, ScrollView, View } from 'react-native'
import { Button, Divider, List, Surface, Text } from 'react-native-paper'
import { styles } from '../../../constants'
import { Spacings } from '../../../utils/Spacings'
import { ModalAlert, Toast } from '../../../utils/Toast'

const themes = [
	{ label: 'Системная', value: 'system' as const },
	{ label: 'Темная', value: 'dark' as const },
	{ label: 'Светлая', value: 'light' as const },
]

const toAppearance = (theme: 'dark' | 'light' | 'system') =>
	theme === 'system' ? null : theme

const nameFormat = [
	{ label: 'ФИО', value: 'fio' as const },
	{ label: 'ИФО', value: 'ifo' as const },
]

export default observer(function AppearanceSettings_() {
	return (
		<ScrollView>
			<List.Section title="Общие">
				<SelectModal
					label="Тема"
					data={themes}
					value={Theme.scheme}
					onSelect={({ value }) => {
						runInAction(() => (Theme.scheme = value))
						Appearance.setColorScheme(toAppearance(value))
					}}
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

			<List.Section title="Дневник">
				<SwitchSetting
					title="Сворачивать длинный текст заданий"
					setting="collapseLongAssignmentText"
				/>
				<SwitchSetting
					title="Использовать календарь для выбора даты"
					setting="newDatePicker"
				/>
			</List.Section>
			<Divider style={{ margin: Spacings.s1 }} />

			<Suspense fallback={<Loading />}>
				<AsyncAccentColorPicker />
			</Suspense>
			<Divider style={{ margin: Spacings.s1 }} />
			{/* {__DEV__ && <DevSettings />} */}
		</ScrollView>
	)
})

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
						true,
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

const AsyncAccentColorPicker = lazy(() => import('./AccentColorPicker'))
