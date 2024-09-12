import { autorun, makeAutoObservable } from 'mobx'
import { Settings } from '~models/settings'
import {
	AssignmentsStore,
	AttachmentsStore,
	DiaryStore,
} from '~services/net-school/store'
import { LANG } from '../../constants'
import { makeReloadPersistable } from '../../utils/makePersistable'

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
				label: 'Прошлая неделя',
				value: Date.week(this.weekBefore)[0].toYYYYMMDD(),
				week: this.weekBefore,
			},
			...this.weekDays.map((day, i) => {
				const today = new Date().toYYYYMMDD() === day.toYYYYMMDD()
				return {
					label: `${LANG.days[i]}${
						today ? ', cегодня' : ` ${day.toYYYYMMDD()}`
					}`,
					value: day.toYYYYMMDD(),
				}
			}),
			{
				label: 'Следующая неделя',
				value: Date.week(this.weekAfter)[0].toYYYYMMDD(),
				week: this.weekAfter,
			},
		]
	}
})()

autorun(() => {
	const { studentId } = Settings
	const { showHomework, weekDays } = DiaryState

	DiaryStore.withParams({
		studentId,
		startDate: weekDays[0].toNetSchool(),
		endDate: weekDays[6].toNetSchool(),
	})

	AssignmentsStore.withParams({
		studentId,
		classmeetingsIds: showHomework
			? DiaryStore.result?.lessons.map(e => e.classmeetingId)
			: undefined,
	})

	const withAttachments = AssignmentsStore.result
		?.filter(e => e.attachmentsExists)
		.map(e => e.assignmentId)

	AttachmentsStore.withParams({
		studentId,
		assignmentIds: withAttachments?.length ? withAttachments : undefined,
	})
})
