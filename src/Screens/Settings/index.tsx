import * as Application from 'expo-application'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { ScrollView } from 'react-native'
import {
	ColorPicker,
	Colors,
	Spacings,
	Switch,
	Text,
	View,
} from 'react-native-ui-lib'
import { Button } from '../../Components/Button'
import { Dropdown } from '../../Components/Dropdown'
import { Loading } from '../../Components/Loading'
import { API } from '../../NetSchool/api'
import {
	ACCENT_COLOR,
	LANG,
	logger,
	settingsButton,
} from '../../Setup/constants'
import { StudentsStore } from '../../Stores/API.stores'
import { Settings, fullname } from '../../Stores/Settings.store'
import { Theme } from '../../Stores/Theme.store'
import { UpdatesButton } from './Update'

const themes = [
	{ name: 'Системная', i: 'system' as const },
	{ name: 'Темная', i: 'dark' as const },
	{ name: 'Светлая', i: 'light' as const },
]

const markStyles = [
	{ name: 'Линия', i: 'border' as const },
	{ name: 'Фон', i: 'background' as const },
]

export const SettingsScreen = observer(function SettingsScreen() {
	const students = StudentsStore
	const [accentColors, setAccentColors] = useState([
		ACCENT_COLOR,
		'#328585',
		'#446EAD',
		'#AD6E25',
		'#B9421E',
	])
	const [expires, setSent] = useState(Date.now())

	function setAccentColor(accentColor: string) {
		if (Date.now() > expires) {
			Theme.setAccentColor(accentColor)
			setSent(Date.now() + 5000)
		} else {
			logger.debug('SSSS')
		}
	}

	const themeKey = Theme.accentColor + Theme.scheme
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
						data={students.result.map((student, i) => ({
							i,
							name: fullname(student.name),
						}))}
						defaultValueByIndex={Settings.studentIndex}
						onSelect={s => Settings.save({ studentIndex: s.i })}
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
				defaultValueByIndex={themes.findIndex(e => e.i === Theme.scheme)}
				onSelect={s => Theme.setColorScheme(s.i)}
				defaultButtonText="Тема"
				buttonTextAfterSelection={i => 'Тема: ' + (i?.name ?? 'По умолчанию')}
				rowTextForSelection={i => i.name}
			/>
			<Button
				{...settingsButton()}
				onPress={() => {
					Settings.save({ notifications: !Settings.notifications })
				}}
			>
				<View flex row center>
					<Text style={{ fontSize: 18, color: Colors.$textPrimary }} marginR-s2>
						{LANG['notification']}
					</Text>
					<Switch
						key={themeKey}
						onValueChange={(notifications: boolean) =>
							Settings.save({ notifications })
						}
						value={Settings.notifications}
					/>
				</View>
			</Button>
			<Button
				{...settingsButton()}
				onPress={() => {
					throw new Error('From sentry!')
				}}
			>
				<Text style={{ fontSize: 18, color: Colors.$textPrimary }} marginR-s2>
					Проверить Sentry
				</Text>
			</Button>
			<Dropdown
				data={markStyles}
				buttonStyle={{ marginBottom: Spacings.s2 }}
				defaultValueByIndex={markStyles.findIndex(
					e => e.i === Settings.markStyle
				)}
				onSelect={s => s.i && Settings.save({ markStyle: s.i })}
				defaultButtonText="Стиль оценок"
				buttonTextAfterSelection={i =>
					'Cтиль оценок: ' + (i?.name ?? 'По умолчанию')
				}
				rowTextForSelection={i => i.name}
			/>
			<UpdatesButton key={themeKey + 'updates'} />
			<Text margin-s2 center key={themeKey + 'text'}>
				Цвет акцентов:
			</Text>
			<ColorPicker
				colors={accentColors}
				onValueChange={(accentColor: string) => setAccentColor(accentColor)}
				backgroundColor={Colors.$backgroundDefault}
				onSubmit={(accentColor: string) => {
					setAccentColors(accentColors.concat(accentColor))
					setAccentColor(accentColor)
				}}
				initialColor={Theme.accentColor}
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
})
