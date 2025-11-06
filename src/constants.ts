import * as Sentry from '@sentry/react-native'
import { StyleSheet } from 'react-native'
import { logger, mapConsoleTransport, sentryTransport } from 'react-native-logs'

export const Logger = logger.createLogger({
	levels: {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3,
	},
	transport: __DEV__
		? mapConsoleTransport
		: /* istanbul ignore next */ sentryTransport,
	transportOptions: {
		// @ts-expect-error This is error in their typings
		SENTRY: Sentry,
		errorLevels: 'error',
	},
	printLevel: false,
})

export const ACCENT_COLOR = '#578059'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const globalStyles = StyleSheet.create({
	stretch: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		alignContent: 'stretch',
	},
	row: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		flex: 1,
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
	s_log_out: 'Выход',
	s_log_in: 'Вход',
	s_diary: 'Дневник',
	s_totals: 'Оценки',
	s_totalsN: 'Оценки ',
	s_settings: 'Настройки',
	s_usefull_tools: 'Инструменты',
	s_subject_totals: 'Итоги по предмету',
} as const
