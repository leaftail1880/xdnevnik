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
	text_field: {
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
	invertedSchedule_item: {
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
	schedule_item: {
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
	table_head: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderColor: SECONDARY_COLOR,
		padding: 7,
		backgroundColor: ACCENT_COLOR,
	},
	table_head_captions: {
		fontSize: 15,
		color: BUTTON_TEXT_COLOR,
	},

	table_body_single_row: {
		backgroundColor: BACKGROUND_COLOR,
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderColor: SECONDARY_COLOR,
		padding: 7,
	},
	table_data: {
		fontSize: 11,
	},
	table: {
		margin: 15,
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 1,
		backgroundColor: BACKGROUND_COLOR,
	},
})

export const LANG = {
	monday: 'Понедельник',
	tuesday: 'Вторник',
	wednesday: 'Среда',
	thursday: 'Четверг',
	friday: 'Пятница',
	saturday: 'Суббота',
	sunday: 'Воскресенье',
	avg_formative: 'Среднее формативов: ',
	avg_summative: 'Среднее саммативов: ',
	avg_final: 'Среднее итоговых: ',
	bronze: 'Бронзовые',
	silver: 'Серебряные',
	golden: 'Золотые',
	enter_username: 'Вы не ввели имя пользователя!',
	enter_username_2: 'Введите своё школьное имя пользователя.',
	enter_password: 'Вы не ввели пароль!',
	enter_password_2: 'Введите свой школьный пароль.',
	error: 'Ошибка',
	err_schedule: 'Расписание',
	err_plan: 'Учебный план',
	err_hw_this: 'Д/з на эту неделю',
	err_hw_next: 'Д/з на следующую неделю',
	err_marks: 'Оценки',
	err_diploma_sport: 'Диплом: Спорт и здоровье',
	err_diploma_creativity: 'Диплом: Творчество и изобретательство',
	err_diploma_responsibility:
		'Диплом: Социальная и гражданская ответственность',
	err_diploma_science: 'Диплом: Наука и познание',
	err_diploma_leadership: 'Диплом: Лидерство и взаимодействие',
	err_olympiads: 'Олимпиады',
	login_success: 'Успех!',
	login_success_2: 'Вы успешно вошли в свой аккаунт.',
	login_fail: 'Неверный логин/пароль!',
	login_fail_2: 'Пожалуйста, введите правильные логин и пароль.',
	uname: 'Имя пользователя',
	pwd: 'Пароль',
	log_in: 'Войти',
	logging_in: 'Входим...',
	log_out: 'Выйти',
	log_out_info:
		'Если вы выйдете, то ваши логин и пароль будут удалены с устройства, и вы не сможете входить автоматически. Также вы не сможете получать уведомления.',
	this_week: 'Эта неделя',
	next_week: 'Следующая неделя',
	made_by: 'Сделано с ❤️ Milk_Cool (Миланом) и Leaftail (Андреем)',
	link: 'Ссылка',
	no_link: 'Ссылки нет',
	s_log_out: 'Выход',
	s_log_in: 'Вход',
	s_diary: 'Дневник',
	s_totals: 'Оценки',
	s_homework: 'Домашка',
	s_other: 'Другое',
	s_other_options: 'Другие опции',
	s_groups: 'Группы',
	s_settings: 'Настройки',
	s_info: 'Информация',
	language: 'Язык',
	notification_error_physical:
		'Нужно использовать настоящее устройство, чтобы получать уведомления.',
	notification_error_token: 'Не получилось получить токен для уведомлений!',
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
