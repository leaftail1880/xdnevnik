import { configure as configureMobx } from 'mobx'
import { configurePersistable } from 'mobx-persist-store'
import { StyleSheet } from 'react-native'
import { logger, mapConsoleTransport } from 'react-native-logs'
import { MMKV } from 'react-native-mmkv'
export const Logger = logger.createLogger<'debug' | 'info' | 'warn' | 'error'>({
	printLevel: false,
	transport: mapConsoleTransport,
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
	log_out: 'Выйти',
	log_out_info:
		'Если вы выйдете, то ваши логин и пароль будут удалены, и вы не сможете входить автоматически. Также, вы не сможете получать уведомления.',
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
