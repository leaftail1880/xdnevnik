import { ScrollView } from 'react-native'
import { Theme } from '../../../../Stores/Theme.store'
import { DropdownSettingsButton } from '../../Components/DropdownSettingsButton'
import { Settings } from '../../../../Stores/Settings.store'
import { Text } from 'react-native-ui-lib'
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

// eslint-disable-next-line mobx/missing-observer
export default function Appearance() {
	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
				alignContent: 'flex-start',
				justifyContent: 'flex-start',
			}}
		>
			<DropdownSettingsButton
				label={'Тема'}
				data={themes}
				defaultValueByIndex={themes.findIndex(e => e.i === Theme.scheme)}
				onSelect={s => Theme.setColorScheme(s.i)}
				selectionText={i => i?.name}
			/>
			<DropdownSettingsButton
				data={markStyles}
				defaultValueByIndex={markStyles.findIndex(
					e => e.i === Settings.markStyle
				)}
				onSelect={s => Settings.save({ markStyle: s.i })}
				label="Стиль оценок"
				selectionText={i => i?.name}
			/>
			<Text margin-s2 center key={Theme.key + 'text'}>
				Цвет акцентов:
			</Text>
			<AccentColorPicker />
		</ScrollView>
	)
}
