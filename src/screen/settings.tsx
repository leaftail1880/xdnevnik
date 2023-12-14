import * as Application from 'expo-application'
import { useContext, useState } from 'react'
import { ScrollView } from 'react-native'
import {
	ColorPicker,
	Colors,
	Spacings,
	Switch,
	Text,
	View,
} from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import { Button } from '../components/Button'
import { Dropdown } from '../components/Dropdown'
import { Loading } from '../components/Loading'
import { ACCENT_COLOR, LANG, fullname, settingsButton } from '../constants'
import { Ctx } from '../hooks/settings'
import { UpdatesButton } from './update'

export function SettingsScreen() {
	const { settings, students } = useContext(Ctx)
	const themes = [
		{ name: 'Системная', i: 'system' as const },
		{ name: 'Темная', i: 'dark' as const },
		{ name: 'Светлая', i: 'light' as const },
	]

	const markStyles = [
		{ name: 'Линия', i: 'border' as const },
		{ name: 'Фон', i: 'background' as const },
	]

	const [accentColors, setAccentColors] = useState([
		ACCENT_COLOR,
		'#328585',
		'#446EAD',
		'#AD6E25',
		'#B9421E',
	])
	const themeKey = settings.accentColor + settings.theme
	const onAccentChange = (color: string) => {
		settings.save({
			accentColor: color === ACCENT_COLOR ? undefined : color,
		})
	}
	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
				alignContent: 'flex-start',
				justifyContent: 'flex-start',
			}}
		>
			{API.session ? (
				students.fallback || (
					<Dropdown
						buttonStyle={{ marginBottom: Spacings.s2 }}
						data={students.result.map((student, i) => {
							return { name: fullname(student.name, settings), i }
						})}
						defaultValueByIndex={settings.studentIndex}
						onSelect={s => settings.save({ studentIndex: s.i })}
						buttonTextAfterSelection={i => i.name}
						rowTextForSelection={i => i.name}
					/>
				)
			) : (
				<Loading text="Ожидание авторизации{dots}"></Loading>
			)}
			<Dropdown
				data={themes}
				buttonStyle={{ marginBottom: Spacings.s2 }}
				defaultValueByIndex={themes.findIndex(e => e.i === settings.theme)}
				onSelect={s => settings.save({ theme: s.i })}
				defaultButtonText="Тема"
				buttonTextAfterSelection={i => 'Тема: ' + (i?.name ?? 'По умолчанию')}
				rowTextForSelection={i => i.name}
			/>
			<Button
				{...settingsButton()}
				onPress={() =>
					settings.save({ notifications: !settings.notifications })
				}
			>
				<View flex row center>
					<Text style={{ fontSize: 18, color: Colors.$textPrimary }} marginR-s2>
						{LANG['notification']}
					</Text>
					<Switch
						key={themeKey}
						onValueChange={notifications => settings.save({ notifications })}
						value={settings.notifications}
					/>
				</View>
			</Button>
			<Dropdown
				data={markStyles}
				buttonStyle={{ marginBottom: Spacings.s2 }}
				defaultValueByIndex={markStyles.findIndex(
					e => e.i === settings.markStyle
				)}
				onSelect={s => s.i && settings.save({ markStyle: s.i })}
				defaultButtonText="Стиль оценок"
				buttonTextAfterSelection={i =>
					'Cтиль оценок: ' + (i?.name ?? 'По умолчанию')
				}
				rowTextForSelection={i => i.name}
			/>
			<UpdatesButton />
			<Text margin-s2 center key={themeKey + 'text'}>
				Цвет акцентов:
			</Text>
			<ColorPicker
				colors={accentColors}
				onValueChange={onAccentChange}
				backgroundColor={Colors.$backgroundDefault}
				onSubmit={color => {
					setAccentColors(accentColors.concat(color))
					onAccentChange(color)
				}}
				initialColor={settings.accentColor}
				key={themeKey}
			/>

			<View padding-s3>
				<Text>Название: {Application.applicationName}</Text>
				<Text>Идентификатор: {Application.applicationId}</Text>
				<Text>Версия: {Application.nativeApplicationVersion}</Text>
				<Text>Версия сборки: {Application.nativeBuildVersion}</Text>
				<Text key={themeKey}>{LANG['made_by']}</Text>
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
}
