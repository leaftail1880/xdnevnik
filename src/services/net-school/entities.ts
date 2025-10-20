import type { CustomSubject, StudentSettings } from '@/models/settings'
import { add, set } from 'date-fns'
import { makeAutoObservable } from 'mobx'
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

function yyyymmddToDate(yyyymmdd: string) {
	const match = yyyymmdd.match(/(\d\d)\.(\d\d)\.(\d\d\d\d)/)
	if (!match) return
	const [, day, month, year] = match.map(e => parseInt(e))
	const date = set(new Date(), {
		year: year,
		date: day,
		month: month - 1,
		hours: 0,
		minutes: 0,
		seconds: 0,
		milliseconds: 0,
	})

	return date
}

export function customSubjectToLessons(
	custom: CustomSubject,
	date: ReadonlyDate,
	i: number,
): Lesson[] {
	const dayFromMonday = date.getDayFromMonday()

	return custom.meetings
		.filter(e => e.dayIndex === dayFromMonday)
		.map((e, ii) => {
			const startTime = set(new Date(date.getTime()), { ...e.startTime })
			const endTime = add(new Date(startTime), { minutes: e.time })

			const id = -1 * (i + 1) * (ii + 1)
			return new Lesson(
				{
					addEducation: true,
					assignmentId: [],
					attachmentsExists: false,
					attendance: null,
					classmeetingId: id,
					day: startTime.toString(),
					endTime: endTime.toString(),
					startTime: startTime.toString(),
					extraActivity: false,
					lessonTheme: '',
					order: id,
					resultsExists: false,
					roomName: '',
					scheduleTimeNumber: 0,
					scheduleTimeRelay: 0,
					studentId: -1,
					subjectGroupId: id,
					subjectId: id,
					subjectName: custom.name,
					teachers: [],
					distanceMeetingId: id,
				},
				true,
				e.sendNotificationBeforeMins * 60,
			)
		})
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
	}

	/**
	 * Gets lesson for specified day
	 * @param day - Day to search for in format yyyymmdd, use Date.toyyyymmdd()
	 */
	forDay(day: string, studentSettings: StudentSettings) {
		const date = yyyymmddToDate(day)
		return this.lessons
			.concat(
				...[
					date
						? studentSettings.customSubjects
								.map((e, i) => customSubjectToLessons(e, date, i))
								.flat()
						: [],
				],
			)
			.filter(lesson => lesson.start(studentSettings).toYYYYMMDD() === day)
			.sort(
				(a, b) =>
					a.start(studentSettings).getTime() -
					b.start(studentSettings).getTime(),
			)
	}

	isNow(lesson: Lesson, studentSettings: StudentSettings) {
		const start = lesson.end(studentSettings)
		const end = lesson.start(studentSettings)
		const date = new Date()

		return date >= start && date <= end
	}
}

export interface ClassMeetingStats {
	passed: number
	scheduled: number
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
	classmeetingsStats: ClassMeetingStats
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
		markCode: 'NotExamined' | 'PointSystem'
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
