import { Logger } from '@/constants'
import type { StudentSettings } from '@/models/settings'
import { makeAutoObservable } from 'mobx'
import { NSEntity } from './entities'

interface BaseLesson {
	classmeetingId: number
	studentId: number
	assignmentId: number[]
	order: number
	scheduleTimeNumber: number
	scheduleTimeRelay: number
	subjectName: string
	subjectId: number
	subjectGroupId: number
	startTime: string
	endTime: string
	teachers: NSEntity[]
	lessonTheme: string
	roomName: string
	attachmentsExists: boolean
	resultsExists: boolean
	attendance: string | number | null
	distanceMeetingId: number
	addEducation: boolean
	extraActivity: boolean
}

export interface RawLesson extends BaseLesson {
	day: string
}

function toTime(...args: number[]) {
	return (
		args
			// Hide hours if they are 0, e.g. seconds i is 2, mins i is 1, hrs i is 0
			.filter((e, i) => (i === 0 ? e !== 0 : true))
			.map(e => e.toString().padStart(2, '0'))
			.join(':')
	)
}

function toHours(ms: number) {
	return Math.ceil(ms / (1000 * 60 * 60))
}

function toMinutes(ms: number) {
	return Math.ceil(ms / (1000 * 60))
}

function separateTime(ms: number) {
	const hours = toHours(ms)
	const minutes = toMinutes(ms)
	return {
		hours: hours - 1,
		minutes: 60 - (hours * 60 - minutes) - 1,
		seconds: 60 - (minutes * 60 - Math.ceil(ms / 1000)) - 1,
	}
}

export enum LessonState {
	NotStarted,
	Going,
	Ended,
}

function getLessonOverridenDate(
	studentSettings: StudentSettings,
	offsetId: number,
	date: ReadonlyDate,
	dayId: string,
	access: string,
) {
	const lessonOrder = studentSettings.lessonOrder[offsetId] ?? {}
	try {
		const offset = lessonOrder?.[dayId]
		if (offset) {
			const newDate = new Date(date.getTime() + offset)
			// debug(
			// 	'Applied offset',
			// 	access,
			// 	offset,
			// 	'to a',
			// 	subjectId,
			// 	'date',
			// 	newDate.toReadable(),
			// )
			return newDate
		}
	} catch (e) {
		Logger.warn(
			'Unable to get lesson overriden date:',
			!!studentSettings,
			offsetId,
			!!lessonOrder,
			e,
		)
	}

	return date
}
/**
 * Class representing one lesson
 */

export class Lesson {
	classmeetingId: number
	studentId: number
	assignmentId: number[]
	order: number
	scheduleTimeNumber: number
	scheduleTimeRelay: number
	subjectName: string
	subjectId: number
	subjectGroupId: number
	teachers: NSEntity[]
	lessonTheme: string
	roomName: string
	distanceMeetingId: number = 0
	attachmentsExists: boolean
	resultsExists: boolean
	attendance: string | number | null
	addEducation: boolean
	extraActivity: boolean
	endDate: ReadonlyDate
	startDate: ReadonlyDate
	dayDate: ReadonlyDate

	isIgnored(studentSettings: StudentSettings) {
		return studentSettings.ignoreLessons?.includes(this.offsetDayId)
	}

	get offsetId() {
		return this.dayDate.getDay()
	}

	get dayId() {
		return `${this.order}${this.subjectId}`
	}

	get offsetDayId() {
		return `${this.offsetId}${this.order}${this.subjectId}`
	}

	start(studentSettings: StudentSettings): ReadonlyDate {
		if (this.isCustom) return this.startDate
		return getLessonOverridenDate(
			studentSettings,
			this.offsetId,
			this.startDate,
			this.dayId,
			'start',
		)
	}

	day(studentSettings: StudentSettings) {
		if (this.isCustom) return this.dayDate
		return this.start(studentSettings)
	}

	end(studentSettings: StudentSettings): ReadonlyDate {
		if (this.isCustom) return this.endDate
		return getLessonOverridenDate(
			studentSettings,
			this.offsetId,
			this.endDate,
			this.dayId,
			'end',
		)
	}

	/**
	 * Creates new lesson
	 * @param lesson - Raw lesson got from fetch response
	 */
	constructor(
		lesson: RawLesson,
		public readonly isCustom = false,
		public readonly notifyBeforeSeconds = 15 * 60,
	) {
		const { endTime, startTime, day, ...ours } = lesson
		Object.assign(this, ours)

		/**
		 * Start date of the lesson
		 */
		this.startDate = new Date(startTime)
		/**
		 * End date of the lesson
		 */
		this.endDate = new Date(endTime)
		/**
		 * Day date of the lesson
		 */
		this.dayDate = new Date(day)

		makeAutoObservable(this, {
			end: false,
			start: false,
			offsetId: false,
			dayId: false,
			offsetDayId: false,
		})
	}

	static status(start: number, end: number, now = Date.now()) {
		const beforeStartMs = start - now
		const beforeStart = separateTime(beforeStartMs)
		const beforeEnd = separateTime(now - start)
		const total = separateTime(end - start)
		const progress = 100 - Math.ceil(((end - now) * 100) / (end - start))

		return {
			beforeStartMs: beforeStartMs,
			startsAfter: `Начнется через ${toTime(beforeStart.hours, beforeStart.minutes, beforeStart.seconds)}`,
			elapsed: `${total.hours >= 1 ? toTime(0, beforeEnd.hours, beforeEnd.minutes + 1) : toTime(beforeEnd.hours, beforeEnd.minutes + 1)}/${toTime(...(total.minutes + 1 >= 60 ? [total.hours + 1, 0] : [total.hours, total.minutes + 1]))}`,
			remaining: toTime(
				total.hours - beforeEnd.hours,
				total.minutes - beforeEnd.minutes,
				total.seconds - beforeEnd.seconds,
			),
			progress,
			state:
				now < start
					? LessonState.NotStarted
					: now <= end
						? LessonState.Going
						: LessonState.Ended,
		}
	}
}
