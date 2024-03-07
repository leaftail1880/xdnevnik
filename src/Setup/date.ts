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
		getDayMon(): number
	}
}

export {}

Date.prototype.toNetSchool = function (this: Date) {
	return this.toJSON().split('T')[0]
}

Date.prototype.getDayMon = function (this: Date) {
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
			(_, i) => new Date(date.getTime() - (date.getDayMon() - i) * dayInMs)
		) as ReturnType<typeof Date.week>

AbortSignal.timeout = ms => {
	const controller = new AbortController()

	setTimeout(() => {
		if (!controller.signal.aborted) controller.abort()
	}, ms)

	return controller.signal
}