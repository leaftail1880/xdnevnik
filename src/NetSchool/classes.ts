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

export interface AssignmentForCurrentTerm {
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

export interface RawLesson {
	classmeetingId: number
	studentId: number
	assignmentId: number[]
	order: number
	scheduleTimeNumber: number
	scheduleTimeRelay: number
	day: string
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

/**
 * Class representing one lesson
 */
class Lesson {
	public id: number
	public subjectName: string
	public roomName: string
	public lessonTheme: string
	public teachers: NSEntity[]
	private _end: string
	private _start: string
	private _day: string
	public classmetingId: number

	/**
	 * Creates new lesson
	 * @param lesson - Raw lesson got from fetch response
	 */
	public constructor(lesson: RawLesson) {
		this.id = lesson.classmeetingId
		this.subjectName = lesson.subjectName
		this.classmetingId = lesson.classmeetingId
		this.roomName = lesson.roomName
		this._end = lesson.endTime
		this._start = lesson.startTime
		this._day = lesson.day
		this.lessonTheme = lesson.lessonTheme
		this.teachers = lesson.teachers
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
	public lessons: Lesson[]

	/**
	 * Creates new diary
	 * @param lessons - Raw lessons from fetch response
	 */
	public constructor(lessons: RawLesson[]) {
		this.lessons = lessons.map(lesson => new Lesson(lesson))
		// TODO Apply custom lesson names, add custom lessons
	}

	/**
	 * Gets lesson for specified day
	 * @param day - Day to search for
	 */
	public forDay(day: Date | string) {
		if (day instanceof Date) day = day.toYYYYMMDD()
		return this.lessons.filter(lesson => lesson.day.toYYYYMMDD() === day)
	}

	/**
	 * Gets lesson for specified date
	 * @param date - Date to search for
	 */
	public forTime(date: Date) {
		return this.forDay(date).find(
			({ start, end }) => date >= start && date < end
		)
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
	attendance: []
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
