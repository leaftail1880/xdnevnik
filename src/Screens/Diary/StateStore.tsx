import { makeAutoObservable } from 'mobx'
import { makeReloadPersistable } from '../../Stores/makePersistable'
import { LANG } from '../../constants'

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
				day: Date.week(this.weekBefore)[0],
				week: this.weekBefore,
				selected: false,
			},
			...Date.week(this.weekDate).map((day, i) => {
				const today = new Date().toYYYYMMDD() === day
				return {
					name: `${LANG.days[i]}${
						today ? ', cегодня' : ' ' + new Date(day).toLocaleDateString([])
					}`,
					day: day,
					selected: day === this.diaryDay,
				}
			}),
			{
				name: 'Следующая неделя',
				day: Date.week(this.weekAfter)[0],
				week: this.weekAfter,
				selected: false,
			},
		]
	}
	showHomework = true
})()
