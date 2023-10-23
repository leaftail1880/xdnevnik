import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import { Alert, ScrollView, Switch, View } from 'react-native'

import { useTheme } from '@react-navigation/native'
import { API } from '../NetSchool/api'
import { Student } from '../NetSchool/classes'
import { Button } from '../components/button'
import { Dropdown } from '../components/dropdown'
import { Loading } from '../components/loading'
import { Text } from '../components/text'
import {
	ACCENT_COLOR,
	BUTTON_TEXT_COLOR,
	INVISIBLE_COLOR,
	LANG,
	SECONDARY_COLOR,
	styles,
} from '../constants'
import { AsyncState } from '../hooks/async'
import { SettingsCtx } from '../hooks/settings'

export function SettingsScreen(props: {
	ctx: {
		settings: SettingsCtx
		students: AsyncState<Student[]>
	}
}) {
	const { settings, students } = props.ctx
	const theme = useTheme()
	const themes = [
		{ name: 'Системная', i: 'system' as const },
		{ name: 'Темная', i: 'dark' as const },
		{ name: 'Светлая', i: 'light' as const },
		{ name: 'Своя', i: 'light' as const },
	]
	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
				backgroundColor: INVISIBLE_COLOR,
				width: '100%',
				minHeight: 400,
				alignContent: 'flex-start',
				justifyContent: 'flex-start',
			}}
		>
			{API.authorized ? (
				students[1] || (
					<Dropdown
						buttonStyle={{ width: '100%', ...styles.button }}
						buttonTextStyle={styles.buttonText}
						dropdownStyle={{ width: '100%', borderRadius: 5 }}
						data={students[0].map((student, i) => {
							return { name: DisplayName(student.name, settings), i }
						})}
						defaultValueByIndex={settings.studentIndex}
						onSelect={s => settings.save({ studentIndex: s.i })}
						buttonTextAfterSelection={i => i.name}
						rowTextForSelection={i => i.name}
					></Dropdown>
				)
			) : (
				<Loading text="Ожидание авторизации{dots}"></Loading>
			)}
			<View style={[styles.settingBase, styles.stretch]}>
				<Text>{LANG['notification']}</Text>
				<Switch
					trackColor={{ false: SECONDARY_COLOR, true: ACCENT_COLOR }}
					thumbColor={settings.notifications ? ACCENT_COLOR : BUTTON_TEXT_COLOR}
					onValueChange={notifications => settings.save({ notifications })}
					value={settings.notifications}
				/>
			</View>
			<View style={[styles.settingBase, styles.stretch]}>
				<Text>Тема</Text>
				<Dropdown
					dropdownStyle={{ width: '100%', borderRadius: 5 }}
					data={themes}
					buttonTextStyle={{ fontSize: 14, color: theme.colors.text }}
					defaultValueByIndex={themes.findIndex(e => e.i === settings.theme)}
					onSelect={s => settings.save({ theme: s.i })}
					buttonTextAfterSelection={i => i.name}
					rowTextForSelection={i => i.name}
				></Dropdown>
			</View>
			<View>
				<Button
					style={styles.settingBase}
					onPress={async () => {
						try {
							const update = await Updates.checkForUpdateAsync()

							if (update.isAvailable) {
								Alert.alert('Скачиваем обнову чееек')

								await Updates.fetchUpdateAsync()
								await Updates.reloadAsync()
							} else {
								Alert.alert('Обновление недоступно, разраб жмот')
							}
						} catch (error) {
							Alert.alert(
								`Не удалось получить обновление, вылезла кака`,
								'' + error
							)
						}
					}}
				>
					<Text>Проверить обновления</Text>
				</Button>
			</View>
			<View>
				<Text>Название: {Application.applicationName}</Text>
				<Text>Идентификатор: {Application.applicationId}</Text>
				<Text>Версия: {Application.nativeApplicationVersion}</Text>
				<Text>Версия сборки: {Application.nativeBuildVersion}</Text>
				<Text>{LANG['made_by']}</Text>
			</View>
		</ScrollView>
	)
}

export function DisplayName(name: string, settings: SettingsCtx) {
	if (settings.lastNameLast) {
		const parts = name.split(' ')
		return [parts[1], parts[2], parts[0]].join(' ')
	} else return name
}
