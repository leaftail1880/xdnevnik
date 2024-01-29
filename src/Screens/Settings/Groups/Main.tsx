import * as Application from 'expo-application'
import * as updates from 'expo-updates'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { Text, View } from 'react-native-ui-lib'
import { Loading } from '../../../Components/Loading'
import { API } from '../../../NetSchool/api'
import { LANG } from '../../../Setup/constants'
import { StudentsStore } from '../../../Stores/API.stores'
import { Settings, fullname } from '../../../Stores/Settings.store'
import { Theme } from '../../../Stores/Theme.store'
import { DropdownSettingsButton } from '../Components/DropdownSettingsButton'
import { SwitchSetting } from '../Components/SwitchSetting'
import { AccentColorPicker } from './AccentColorPicker'
import { UpdatesButton } from './Update/Update'

const themes = [
	{ name: 'Системная', i: 'system' as const },
	{ name: 'Темная', i: 'dark' as const },
	{ name: 'Светлая', i: 'light' as const },
]

const markStyles = [
	{ name: 'Линия', i: 'border' as const },
	{ name: 'Фон', i: 'background' as const },
]

export const MainSettings = observer(function MainSettings() {
	const students = StudentsStore
	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
				alignContent: 'flex-start',
				justifyContent: 'flex-start',
			}}
		>
			<View margin-s1></View>
			{API.session ? (
				students.fallback || (
					<DropdownSettingsButton
						data={students.result.map((student, i) => ({
							i,
							name: fullname(student.name),
						}))}
						onSelect={s => Settings.save({ studentIndex: s.i })}
						selectionText={i => i?.name}
						defaultValueByIndex={Settings.studentIndex}
						label={false}
						buttonViewStyle={{ alignItems: 'center', justifyContent: 'center' }}
					/>
				)
			) : (
				<Loading text="Ожидание авторизации{dots}"></Loading>
			)}
			<DropdownSettingsButton
				label={'Тема'}
				data={themes}
				defaultValueByIndex={themes.findIndex(e => e.i === Theme.scheme)}
				onSelect={s => Theme.setColorScheme(s.i)}
				selectionText={i => i?.name}
			/>
			<SwitchSetting
				label={'Уведомления'}
				setting="notifications"
				key={Theme.key}
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
			<UpdatesButton key={Theme.key + 'updates'} />
			<Text margin-s2 center key={Theme.key + 'text'}>
				Цвет акцентов:
			</Text>
			<AccentColorPicker />
			<View padding-s3>
				<Text>Название: {Application.applicationName}</Text>
				<Text>Идентификатор: {Application.applicationId}</Text>
				<Text>Версия: {Application.nativeApplicationVersion}</Text>
				<Text>Версия сборки: {updates.updateId}</Text>
				<Text key={Theme.key}>{LANG['made_by']}</Text>
			</View>
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
