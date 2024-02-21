import { makeAutoObservable } from 'mobx'
import { LANG } from '../../Setup/constants'
import { makeReloadPersistable } from '../../Stores/makePersistable'

export const DiaryState = new (class {
	constructor() {
		makeAutoObservable<this, 'weekOffset'>(this, {
			weekOffset: false,
		})
		makeReloadPersistable(this, {
			name: 'diary',
			properties: ['showHomework', 'showAttachments', 'showLessonTheme'],
		})
	}

	day = new Date().toYYYYMMDD()
	week = new Date()

	showHomework = true
	showAttachments = true
	showLessonTheme = true

	get weekDays() {
		return Date.week(this.week)
	}
	private weekOffset(offset: number) {
		const date = new Date()
		date.setDate(this.week.getDate() + offset)
		return date
	}
	get weekBefore() {
		return this.weekOffset(-7)
	}
	get weekAfter() {
		return this.weekOffset(7)
	}
	get weekDaysDropdown() {
		return [
			{
				name: 'Прошлая неделя',
				day: Date.week(this.weekBefore)[0].toYYYYMMDD(),
				week: this.weekBefore,
				selected: false,
			},
			...this.weekDays.map((day, i) => {
				const today = new Date().toYYYYMMDD() === day.toYYYYMMDD()
				return {
					name: `${LANG.days[i]}${
						today ? ', cегодня' : ` ${day.toYYYYMMDD()}`
					}`,
					day: day.toYYYYMMDD(),
					selected: day.toYYYYMMDD() === this.day,
				}
			}),
			{
				name: 'Следующая неделя',
				day: Date.week(this.weekAfter)[0].toYYYYMMDD(),
				week: this.weekAfter,
				selected: false,
			},
		]
	}
})()
