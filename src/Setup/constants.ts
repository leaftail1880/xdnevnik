import { configure as configureMobx } from 'mobx'
import { configurePersistable } from 'mobx-persist-store'
import { LogBox, StyleSheet } from 'react-native'
import { logger, mapConsoleTransport } from 'react-native-logs'
import { MMKV } from 'react-native-mmkv'
import {
	Colors,
	TextFieldProps,
	TextProps,
	ThemeManager,
} from 'react-native-ui-lib'

export const Logger = logger.createLogger<'debug' | 'info' | 'warn' | 'error'>({
	printLevel: false,
	transport: mapConsoleTransport,
})

LogBox.ignoreLogs([/new NativeEventEmitter/g])

configureMobx({
	enforceActions: 'always',
	computedRequiresReaction: true,
	reactionRequiresObservable: true,
})

const storage = new MMKV()

configurePersistable({
	removeOnExpiration: false,
	storage: {
		setItem: (key, data) => storage.set(key, data),
		getItem: key => storage.getString(key)!,
		removeItem: key => storage.delete(key),
	},
})

export const ACCENT_COLOR = '#578059'

ThemeManager.setComponentTheme('Text', (props: TextProps) => {
	return {
		$textPrimary: true,
		...props,
		style: [{ fontSize: 16 }, props.style],
	} satisfies TextProps
})

ThemeManager.setComponentTheme('TextField', (props: TextFieldProps) => {
	return {
		placeholderTextColor: Colors.rgba(Colors.$backgroundPrimaryHeavy, 0.6),
		style: [
			{
				borderBottomWidth: 3,

				borderBottomColor: Colors.$backgroundPrimaryHeavy,
			},
			props.style,
		],
	} satisfies TextFieldProps
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export const styles = StyleSheet.create({
	stretch: {
		padding: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		alignContent: 'stretch',
	},
	table: {
		margin: 0,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 400,
		padding: 0,
		width: '100%',
		elevation: 1,
	},
	tableRow: {
		flexDirection: 'row',
		alignSelf: 'center',
		width: '100%',
		padding: 7,

		borderBottomWidth: 3,
		borderColor: ACCENT_COLOR,
	},
	tableCell: {
		padding: 7,
		margin: 3,
		borderRadius: 5,
		borderColor: ACCENT_COLOR,
	},
})

export const LANG = {
	days: [
		'Понедельник',
		'Вторник',
		'Среда',
		'Четверг',
		'Пятница',
		'Суббота',
		'Воскресенье',
	],
	log_out: 'Выйти',
	log_out_info:
		'Если вы выйдете, то ваши логин и пароль будут удалены с устройства, и вы не сможете входить автоматически. Также вы не сможете получать уведомления.',
	made_by: 'Сделано с ❤️ Leaftail (Андреем) и Milk_Cool (Миланом)',
	s_log_out: 'Выход',
	s_log_in: 'Вход',
	s_diary: 'Дневник',
	s_totals: 'Оценки',
	s_totalsN: 'Оценки ',
	s_settings: 'Настройки',
	s_subject_totals: 'Итоги по предмету',
	notification: 'Уведомления',
} as const
