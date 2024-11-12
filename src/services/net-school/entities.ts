import { makeAutoObservable } from 'mobx'

export interface Endpoint {
	name: string
	url: string
}

export interface Student {
	name: string
	shortName: string
	studentId: number
}

export interface Education {
	class: NSEntity & {
		isFree: boolean
	}
	isAddSchool: boolean
	school: NSEntity
	schoolyear: NSEntity & {
		endDate: string
		startDate: string
	}
}

export interface Subject extends NSEntity {
	order: number
	federalСurriculum: boolean
}

export interface Assignment {
	classmeetingId: number
	assignmentId: number
	assignmentName: string
	description?: string
	result: string | number | null
	classAssignment: boolean
	duty: boolean
	comment: string | number | null
	assignmentTypeId: number
	assignmentTypeAbbr: string
	assignmentTypeName: string
	weight: number
	attachmentsExists: boolean
	hasTextAnswer: boolean
	hasFileAnswers: boolean
	subjectId: number
	subjectName: string
	dueDate: string
	answerFilesCount: number
	extraActivity: boolean
	resultDate: string | number | null
	assignmentDate: string
	canAnswer: boolean
}

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

interface RawLesson extends BaseLesson {
	day: string
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
	end: ReadonlyDate
	start: ReadonlyDate
	day: ReadonlyDate

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
		this.start = new Date(startTime)
		/**
		 * End date of the lesson
		 */
		this.end = new Date(endTime)
		/**
		 * Day date of the lesson
		 */
		this.day = new Date(day)

		makeAutoObservable(this)
	}

	static status(lesson: Lesson, now = Date.now()) {
		const start = lesson.start.getTime()
		const end = lesson.end.getTime()
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

function toTime(...args: number[]) {
	return args.map(e => e.toString().padStart(2, '0')).join(':')
}

function toMinutes(ms: number) {
	return Math.ceil(ms / (1000 * 60))
}

function toSecondsAndMinutes(ms: number) {
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

/**
 * Class representing diary
 */
export class Diary {
	lessons: Lesson[]

	/**
	 * Creates new diary
	 * @param lessons - Raw lessons from fetch response
	 */
	constructor(lessons: RawLesson[]) {
		this.lessons = lessons.map(lesson => new Lesson(lesson))
		makeAutoObservable(this, { forDay: false, isNow: false, lessons: true })
		// TODO add custom lessons
	}

	/**
	 * Gets lesson for specified day
	 * @param day - Day to search for
	 */
	forDay(day: Date | string) {
		if (day instanceof Date) day = day.toYYYYMMDD()
		return this.lessons.filter(lesson => lesson.day.toYYYYMMDD() === day)
	}

	isNow(lesson: Lesson) {
		const { start, end } = lesson
		const date = new Date()

		return date >= start && date <= end
	}
}

/**
 * ALl marks for one subject
 */
export interface SubjectPerformance {
	subject: NSEntity
	term: NSEntity
	averageMark: number
	classAverageMark: number
	maxMark: number
	classmeetingsStats: {
		passed: number
		scheduled: number
	}
	teachers: NSEntity[]
	results: {
		date: string
		assignmentId: number
		classMeetingId: number
		classMeetingDate: string
		result: number
		duty: boolean
		comment: string | number | null
		weight: number
		assignmentTypeId: number
		assignmentTypeAbbr: string
		assignmentTypeName: string
	}[]
	markStats: {
		mark: number
		count: number
		fraction: number
	}[]
	attendance: {
		classMeetingId: number
		classMeetingDate: string
		attendanceMark: string
	}[]
}

/**
 * Total marks of the subject
 */
export interface Total {
	subjectId: number
	termTotals: {
		term: NSEntity
		mark: string | number | null
		avgMark: number | null
	}[]
	yearTotals: {
		period: {
			id: number
			periodName: string
			periodType: string
		}
		mark: string | number | null
	}[]
}

export interface RawEndpoints {
	items: ({ demo: boolean } & Endpoint)[]
}

export interface NSEntity {
	id: number
	name: string
}
export type ReactStateHook = {
	authorized: null | true
	updateEffects: number
}

export interface Attachment {
	classMeetingId: number
	assignmentId: number
	attachmentId: number
	fileName: string
	description: null | string
}
export type PartialAssignment = Partial<
	Omit<
		SubjectPerformance['results'][number],
		'result' | 'assignmentId' | 'date'
	>
> & {
	date: string
	result: 'Нет' | number | string
	assignmentId: string | number
	custom?: boolean
}
