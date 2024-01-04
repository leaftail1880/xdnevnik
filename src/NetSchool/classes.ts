import { makeAutoObservable, makeObservable } from 'mobx'

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
	private _end: string
	private _start: string
	private _day: string
	public classmeetingId: number
	public studentId: number
	public assignmentId: number[]
	public order: number
	public scheduleTimeNumber: number
	public scheduleTimeRelay: number
	public subjectName: string
	public subjectId: number
	public subjectGroupId: number
	public teachers: NSEntity[]
	public lessonTheme: string
	public roomName: string
	public attachmentsExists: boolean
	public resultsExists: boolean
	public attendance: string | number | null
	public addEducation: boolean
	public extraActivity: boolean

	/**
	 * Creates new lesson
	 * @param lesson - Raw lesson got from fetch response
	 */
	public constructor(lesson: RawLesson) {
		const { endTime, startTime, day, ...ours } = lesson
		Object.assign(this, ours)

		this._end = endTime
		this._start = startTime
		this._day = day

		makeAutoObservable(this)
	}

	/**
	 * End date of the lesson
	 */
	public get end() {
		return new Date(this._end)
	}

	/**
	 * Start date of the lesson
	 */
	public get start() {
		return new Date(this._start)
	}

	/**
	 * Day date of the lesson
	 */
	public get day() {
		return new Date(this._day)
	}
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
		makeObservable(this, { forDay: true, isNow: false, lessons: false })
		this.lessons = lessons.map(lesson => new Lesson(lesson))
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
	teachers: NSEntity
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
