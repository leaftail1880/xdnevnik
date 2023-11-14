import { useTheme } from '@react-navigation/native'
import * as Application from 'expo-application'
import { useContext } from 'react'
import { ScrollView, Switch, View } from 'react-native'
import { API } from '../NetSchool/api'
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
import { CTX, SettingsCtx } from '../hooks/settings'
import { UpdatesButton } from './update'

export function SettingsScreen() {
	const { settings, students } = useContext(CTX)
	const theme = useTheme()
	const themes = [
		{ name: 'Системная', i: 'system' as const },
		{ name: 'Темная', i: 'dark' as const },
		{ name: 'Светлая', i: 'light' as const },
		{ name: 'Своя', i: 'light' as const },
	]
	const textStyle = { fontSize: 15, color: theme.colors.text }
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
			{API.session ? (
				students.fallback || (
					<Dropdown
						buttonStyle={[
							{ width: '100%', backgroundColor: INVISIBLE_COLOR },
							styles.settingBase,
						]}
						buttonTextStyle={{ fontSize: 15, color: theme.colors.text }}
						dropdownStyle={{ width: '100%', borderRadius: 5 }}
						data={students.result.map((student, i) => {
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
				<Text style={[textStyle, { margin: 10 }]}>{LANG['notification']}</Text>
				<Switch
					trackColor={{ false: SECONDARY_COLOR, true: ACCENT_COLOR }}
					thumbColor={settings.notifications ? ACCENT_COLOR : BUTTON_TEXT_COLOR}
					onValueChange={notifications => settings.save({ notifications })}
					value={settings.notifications}
				/>
			</View>
			<Dropdown
				data={themes}
				dropdownStyle={{ width: '100%', borderRadius: 5 }}
				buttonStyle={[
					styles.settingBase,
					styles.stretch,
					{ padding: 0, width: '100%', backgroundColor: INVISIBLE_COLOR },
				]}
				buttonTextStyle={textStyle}
				defaultValueByIndex={themes.findIndex(e => e.i === settings.theme)}
				onSelect={s => settings.save({ theme: s.i })}
				renderCustomizedButtonChild={i => (
					<View style={styles.stretch}>
						<Text style={textStyle}>Тема:</Text>
						<Text style={textStyle}>{i?.name ?? 'По умолчанию'}</Text>
					</View>
				)}
				rowTextForSelection={i => i.name}
			/>
			<UpdatesButton />
			<View style={styles.settingBase}>
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
