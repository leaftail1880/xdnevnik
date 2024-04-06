import { configure as configureMobx } from 'mobx'
import { configurePersistable } from 'mobx-persist-store'
import { StyleSheet } from 'react-native'
import { logger, mapConsoleTransport, sentryTransport } from 'react-native-logs'
import { MMKV } from 'react-native-mmkv'

import * as Sentry from '@sentry/react-native'

export const Logger = logger.createLogger<'debug' | 'info' | 'warn' | 'error'>({
	printLevel: false,
	transport: __DEV__ ? mapConsoleTransport : sentryTransport,
	transportOptions: {
		SENTRY: Sentry,
		errorLeves: "error",
	},
})

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

// eslint-disable-next-line @typescript-eslint/naming-convention
export const styles = StyleSheet.create({
	stretch: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		alignContent: 'stretch',
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
	s_subject_totals: 'Итоги по предмету',
} as const
