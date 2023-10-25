import { StyleSheet } from 'react-native'
import { logger, mapConsoleTransport } from 'react-native-logs'

type LogLevel = (...args: unknown[]) => void
export const LOGGER = logger.createLogger({
	printLevel: false,
	transport: mapConsoleTransport,
}) as {
	debug: LogLevel
	info: LogLevel
	warn: LogLevel
	error: LogLevel
}

export const ACCENT_COLOR = '#4d914f'
export const RED_ACCENT_COLOR = '#f88'
export const SECONDARY_COLOR = '#888'
export const BUTTON_TEXT_COLOR = '#fff'
export const NOTIFICATION_COLOR = '#8888ff'
export const INVISIBLE_COLOR = '#fff0'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	stretch: {
		padding: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignContent: 'stretch',
	},
	textField: {
		margin: 15,
		padding: 15,
		borderColor: ACCENT_COLOR,
		borderWidth: 3,
		borderRadius: 5,
		minWidth: 250,
	},
	pressedButton: {
		backgroundColor: SECONDARY_COLOR,
	},
	button: {
		margin: 15,
		padding: 15,
		backgroundColor: ACCENT_COLOR,
		alignItems: 'center',
		borderRadius: 5,
		minWidth: 250,
		elevation: 3,
	},
	buttonText: {
		color: BUTTON_TEXT_COLOR,
	},
	settingBase: {
		padding: 7,
	},
	table: {
		margin: 0,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 400,
		padding: 5,
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
	made_by: 'Сделано с ❤️ Milk_Cool (Миланом) и Leaftail (Андреем)',
	s_log_out: 'Выход',
	s_log_in: 'Вход',
	s_diary: 'Дневник',
	s_totals: 'Оценки',
	s_totalsN: 'Оценки ',
	s_homework: 'Домашка',
	s_settings: 'Настройки',
	s_subject_totals: 'Итоги по предмету',
	notification: 'Уведомления',
	notification_disable: 'Выключить уведомления',
	notification_enable: 'Включить уведомления',
} as const

declare global {
	interface DateConstructor {
		week: [string, string, string, string, string, string, string]
	}
	interface Date {
		weekStart(): Date
		weekEnd(): Date
		toYYYYMMDD(): string
		toHHMM(): string
		weekStartDay: number
		getDayMon(): number
	}
}
Date.prototype.getDayMon = function (this: Date) {
	return [6, 0, 1, 2, 3, 4, 5][this.getDay()]
}
Date.prototype.toYYYYMMDD = function (this: Date) {
	return this.toLocaleDateString([], { dateStyle: 'medium' })
		.split('.')
		.reverse()
		.join('-')
}
Date.prototype.toHHMM = function (this: Date) {
	return (
		this.getHours().toString().padStart(2, '0') +
		':' +
		this.getMinutes().toString().padStart(2, '0')
	)
}

const dayInMs = 1000 * 60 * 60 * 24
Date.week = new Array(7)
	.fill('')
	.map((_, i) =>
		new Date(Date.now() - (new Date().getDayMon() - i) * dayInMs).toYYYYMMDD()
	) as typeof Date.week
