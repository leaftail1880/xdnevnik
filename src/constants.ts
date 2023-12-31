import AsyncStorage from '@react-native-async-storage/async-storage'
import { configure } from 'mobx'
import { configurePersistable } from 'mobx-persist-store'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import {
	mapConsoleTransport,
	logger as reactNativeLogger,
} from 'react-native-logs'
import {
	Colors,
	ContainerModifiers,
	Spacings,
	TextFieldProps,
	TextProps,
	ThemeManager,
} from 'react-native-ui-lib'
import { dropdownStyle } from './Components/Dropdown'

configure({
	enforceActions: 'always',
	computedRequiresReaction: true,
	reactionRequiresObservable: true,
	// observableRequiresReaction: true,
	// disableErrorBoundaries: true,
})

configurePersistable({
	removeOnExpiration: false,
	storage: AsyncStorage,
})

type LogFunction = (...args: unknown[]) => void

// eslint-disable-next-line @typescript-eslint/naming-convention
export const logger = reactNativeLogger.createLogger({
	printLevel: false,
	transport: mapConsoleTransport,
}) as {
	debug: LogFunction
	info: LogFunction
	warn: LogFunction
	error: LogFunction
}

export const ACCENT_COLOR = '#4d914f'

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
	made_by: 'Сделано с ❤️ Milk_Cool (Миланом) и Leaftail (Андреем)',
	s_log_out: 'Выход',
	s_log_in: 'Вход',
	s_diary: 'Дневник',
	s_totals: 'Оценки',
	s_totalsN: 'Оценки ',
	s_settings: 'Настройки',
	s_subject_totals: 'Итоги по предмету',
	notification: 'Уведомления',
	notification_disable: 'Выключить уведомления',
	notification_enable: 'Включить уведомления',
} as const

declare global {
	interface DateConstructor {
		week(date: Date): [string, string, string, string, string, string, string]
	}
	interface Date {
		weekStart(): Date
		weekEnd(): Date
		toYYYYMMDD(): string
		toHHMM(): string
		weekStartDay: number
		toReadable(): string
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

Date.prototype.toReadable = function (this: Date) {
	return this.toHHMM() + ' ' + this.toYYYYMMDD()
}

const dayInMs = 1000 * 60 * 60 * 24
Date.week = date =>
	new Array(7)
		.fill('')
		.map((_, i) =>
			new Date(date.getTime() - (date.getDayMon() - i) * dayInMs).toYYYYMMDD()
		) as ReturnType<typeof Date.week>

export function settingsButton(): {
	style: StyleProp<ViewStyle>
} & ContainerModifiers {
	return {
		row: true,
		spread: true,
		style: [
			dropdownStyle(),
			{
				margin: 0,
				padding: Spacings.s3,
				marginBottom: Spacings.s2,
				minHeight: 40,
			},
		],
	}
}
