import { Picker } from '@react-native-picker/picker'
import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import { Alert, Switch, Text, View } from 'react-native'
import { Student } from '../NetSchool/classes'
import { Button } from '../components/button'
import {
	ACCENT_COLOR,
	BUTTON_TEXT_COLOR,
	INVISIBLE_COLOR,
	LANG,
	SECONDARY_COLOR,
	STYLES,
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
	return (
		<View
			style={{
				...STYLES.container,
				backgroundColor: INVISIBLE_COLOR,
				minWidth: 350,
				minHeight: 400,
				alignContent: 'flex-start',
				justifyContent: 'flex-start',
			}}
		>
			{students[1] || (
				<Picker
					style={{ width: 350 }}
					selectedValue={settings.studentIndex}
					onValueChange={studentIndex => settings.save({ studentIndex })}
				>
					{students[0].map((student, index) => {
						return (
							<Picker.Item
								label={student.name}
								key={student.name}
								value={index.toString()}
							/>
						)
					})}
				</Picker>
			)}
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					maxWidth: 350,
					margin: 15,
				}}
			>
				<Text style={{ flex: 1, flexDirection: 'row' }}>
					{LANG['notification']}
				</Text>
				<Switch
					trackColor={{ false: SECONDARY_COLOR, true: ACCENT_COLOR }}
					thumbColor={settings.notifications ? ACCENT_COLOR : BUTTON_TEXT_COLOR}
					onValueChange={notifications => settings.save({ notifications })}
					value={settings.notifications}
				/>
			</View>
			<View>
				<Button
					style={STYLES.button}
					onPress={async () => {
						try {
							const update = await Updates.checkForUpdateAsync()

							if (update.isAvailable) {
								await Updates.fetchUpdateAsync()
								await Updates.reloadAsync()
							}
						} catch (error) {
							Alert.alert(`Не удалось получить обновление`, '' + error)
						}
					}}
				>
					<Text style={STYLES.buttonText}>Проверить обновления</Text>
				</Button>
			</View>
			<View>
				<Text>Название: {Application.applicationName}</Text>
				<Text>Идентификатор: {Application.applicationId}</Text>
				<Text>Версия: {Application.nativeApplicationVersion}</Text>
				<Text>Версия сборки: {Application.nativeBuildVersion}</Text>
				<Text>{LANG['made_by']}</Text>
			</View>
		</View>
	)
}
