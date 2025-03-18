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
	addEducation: boolean
	extraActivity: boolean
}

export interface RawLesson extends BaseLesson {
	day: string
}

export function toTime(...args: number[]) {
	return args.map(e => e.toString().padStart(2, '0')).join(':')
}

function toMinutes(ms: number) {
	return Math.ceil(ms / (1000 * 60))
}

export function toSecondsAndMinutes(ms: number) {
	const minutes = toMinutes(ms)
	return {
		minutes: minutes - 1,
		seconds: 60 - (minutes * 60 - Math.ceil(ms / 1000)) - 1,
	}
}

export enum LessonState {
	notStarted,
	going,
	ended,
}

function getLessonOverridenDate(
	studentSettings: StudentSettings,
	offsetId: number,
	date: ReadonlyDate,
	subjectId: number,
	access: string,
) {
	const lessonOrder = studentSettings.lessonOrder[offsetId] ?? {}
	try {
		const offset = lessonOrder?.[subjectId]
		if (offset) {
			const newDate = new Date(date.getTime() + offset)
			debug(
				'Applied offset',
				access,
				offset,
				'to a',
				subjectId,
				'date',
				newDate.toReadable(),
			)
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
	attachmentsExists: boolean
	resultsExists: boolean
	attendance: string | number | null
	addEducation: boolean
	extraActivity: boolean
	private endDate: ReadonlyDate
	startDate: ReadonlyDate
	private dayDate: ReadonlyDate

	get offsetId() {
		return this.dayDate.getDay()
	}

	start(studentSettings: StudentSettings): ReadonlyDate {
		return getLessonOverridenDate(
			studentSettings,
			this.offsetId,
			this.startDate,
			this.subjectId,
			'start',
		)
	}

	day(studentSettings: StudentSettings) {
		return this.start(studentSettings)
	}

	end(studentSettings: StudentSettings): ReadonlyDate {
		return getLessonOverridenDate(
			studentSettings,
			this.offsetId,
			this.endDate,
			this.subjectId,
			'end',
		)
	}

	/**
	 * Creates new lesson
	 * @param lesson - Raw lesson got from fetch response
	 */
	constructor(lesson: RawLesson) {
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
		})
	}

	static status(
		lesson: Lesson,
		studentSettings: StudentSettings,
		now = Date.now(),
	) {
		const start = lesson.start(studentSettings).getTime()
		const end = lesson.end(studentSettings).getTime()
		const beforeStart = toSecondsAndMinutes(start - now)
		const { minutes: beforeEnd, seconds: beforeEndSeconds } =
			toSecondsAndMinutes(now - start)
		const { minutes: total, seconds: totalSeconds } = toSecondsAndMinutes(
			end - start,
		)
		const progress = 100 - Math.ceil(((end - now) * 100) / (end - start))

		return {
			beforeStart: beforeStart.minutes,
			startsAfter: `Начнется через ${toTime(beforeStart.minutes, beforeStart.seconds)}`,
			elapsed: `${beforeEnd}/${total + 1}`,
			remaining: toTime(total - beforeEnd, totalSeconds - beforeEndSeconds),
			progress,
			state:
				now < start
					? LessonState.notStarted
					: now <= end
						? LessonState.going
						: LessonState.ended,
		}
	}
}
