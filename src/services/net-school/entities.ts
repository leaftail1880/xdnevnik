import { makeAutoObservable } from 'mobx'
import type { StudentSettings } from '~models/settings'
import { Lesson, RawLesson } from './lesson'

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
	forDay(day: Date | string, studentSettings: StudentSettings) {
		if (day instanceof Date) day = day.toYYYYMMDD()
		return this.lessons.filter(
			lesson => lesson.start(studentSettings).toYYYYMMDD() === day,
		)
	}

	isNow(lesson: Lesson, studentSettings: StudentSettings) {
		const start = lesson.end(studentSettings)
		const end = lesson.start(studentSettings)
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
		'result' | 'assignmentId' | 'date' | 'weight' | 'date'
	>
> & {
	date?: string
	result: 'Нет' | number | string
	assignmentId?: string | number
	custom?: boolean
	weight: number
}
