// @ts-expect-error Global variable
globalThis.__TEST__ = false

declare global {
	interface DateConstructor {
		week(date: Date): [Date, Date, Date, Date, Date, Date, Date]
	}
	interface Date {
		weekStart(): Date
		toNetSchool(): string
		weekEnd(): Date
		toYYYYMMDD(): string
		toHHMM(): string
		weekStartDay: number
		toReadable(): string
		getDayFromMonday(): number
	}

	let debug: (...messages: unknown[]) => void
}

export {}

/* istanbul ignore else */
if (__DEV__) {
	// eslint-disable-next-line no-console
	debug = console.log.bind(console)
} else {
	debug = () => {}
}

Date.prototype.toNetSchool = function (this: Date) {
	return this.toJSON().split('T')[0]
}

Date.prototype.getDayFromMonday = function (this: Date) {
	return [6, 0, 1, 2, 3, 4, 5][this.getDay()]
}
Date.prototype.toYYYYMMDD = function (this: Date) {
	return `${this.getDate().toString().padStart(2, '0')}.${(this.getMonth() + 1)
		.toString()
		.padStart(2, '0')}.${this.getFullYear()}`
}
Date.prototype.toHHMM = function (this: Date) {
	return `${this.getHours().toString().padStart(2, '0')}:${this.getMinutes()
		.toString()
		.padStart(2, '0')}`
}
Date.prototype.toReadable = function (this: Date) {
	return this.toHHMM() + ' ' + this.toYYYYMMDD()
}

const dayInMs = 1000 * 60 * 60 * 24
Date.week = date =>
	new Array(7)
		.fill('')
		.map(
			(_, i) =>
				new Date(date.getTime() - (date.getDayFromMonday() - i) * dayInMs),
		) as ReturnType<typeof Date.week>
