import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { Text } from 'react-native-ui-lib'
import { Settings } from '../../../../Stores/Settings.store'
import { Theme } from '../../../../Stores/Theme.store'
import { DropdownSettingsButton } from '../../Components/DropdownSettingsButton'
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
			{/* <ScrollView>
                {Object.entries(Colors)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([key, value]) => {
                        if (key.startsWith('$'))
                            return (
                                <View key={key} flex row spread centerV>
                                    <Text>{key}</Text>
                                    <View key={key} row spread centerV>
                                        <Text>{value}</Text>
                                        <ColorSwatch color={value} />
                                    </View>
                                </View>
                            )
                        else return false
                    })
                    .filter(Boolean)}
            </ScrollView> */}
		</ScrollView>
	)
})
