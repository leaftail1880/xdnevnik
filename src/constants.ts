import { StyleSheet } from 'react-native'

export const ACCENT_COLOR = '#4d914f'
export const RED_ACCENT_COLOR = '#f88'
export const SECONDARY_COLOR = '#888'
export const BUTTON_TEXT_COLOR = '#fff'
export const NOTIFICATION_COLOR = '#8888ff'
export const BACKGROUND_COLOR = '#fff'
export const INVISIBLE_COLOR = '#fff0'

export const STYLES = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACKGROUND_COLOR,
		alignItems: 'center',
		justifyContent: 'center',
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
	invertedScheduleItem: {
		margin: 15,
		padding: 15,
		backgroundColor: BUTTON_TEXT_COLOR,
		borderRadius: 5,
		alignSelf: 'flex-start',
		elevation: 3,
	},
	invertedButtonText: {
		color: ACCENT_COLOR,
	},
	scheduleItem: {
		margin: 15,
		padding: 15,
		backgroundColor: ACCENT_COLOR,
		borderRadius: 5,
		minWidth: 250,
		elevation: 3,
	},
	option: {
		padding: 15,
		borderBottomWidth: 1.5,
		borderBottomColor: SECONDARY_COLOR,
		flexDirection: 'row',
	},
	optionText: {
		fontSize: 18,
		color: ACCENT_COLOR,
		flex: 1,
		justifyContent: 'flex-start',
	},
	optionArrow: {
		color: ACCENT_COLOR,
		justifyContent: 'flex-end',
	},

	table: {
		margin: 0,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 400,
		padding: 5,
		width: '100%',
		elevation: 1,
		backgroundColor: BACKGROUND_COLOR,
	},
	tableRow: {
		flexDirection: 'row',
		alignSelf: 'center',
		padding: 7,

		borderRadius: 3,
		borderWidth: 3,
		borderTopWidth: 0,
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
	s_homework: 'Домашка',
	s_settings: 'Настройки',
	notification: 'Уведомления',
	notification_disable: 'Выключить уведомления',
	notification_enable: 'Включить уведомления',
}

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
