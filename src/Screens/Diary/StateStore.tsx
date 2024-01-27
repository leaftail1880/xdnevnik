import { makeAutoObservable } from 'mobx'
import { LANG } from '../../Setup/constants'
import { makeReloadPersistable } from '../../Stores/makePersistable'

export const DiaryStateStore = new (class {
	constructor() {
		makeAutoObservable<this, 'weekOffset'>(this, { weekOffset: false })
		makeReloadPersistable(this, { name: 'diary', properties: ['showHomework'] })
	}

	diaryDay = new Date().toYYYYMMDD()
	weekDate = new Date()
	get weekDays() {
		return Date.week(this.weekDate)
	}
	private weekOffset(offset: number) {
		const date = new Date()
		date.setDate(this.weekDate.getDate() + offset)
		return date
	}
	get weekBefore() {
		return this.weekOffset(-7)
	}
	get weekAfter() {
		return this.weekOffset(7)
	}
	get weekDaysOptions() {
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
					selected: day.toYYYYMMDD() === this.diaryDay,
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
	showHomework = true
})()
