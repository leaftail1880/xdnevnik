import { NSEntity, Lesson as TLesson } from './api'

class Lesson {
	id: number
	subjectName: string
	roomName: string
	lessonTheme: string
	teachers: NSEntity[]
	private _end: string
	private _start: string
	private _day: string

	constructor(lesson: TLesson) {
		this.id = lesson.classmeetingId
		this.subjectName = lesson.subjectName
		this.roomName = lesson.roomName
		this._end = lesson.endTime
		this._start = lesson.startTime
		this._day = lesson.day
		this.lessonTheme = lesson.lessonTheme
		this.teachers = lesson.teachers
	}

	get end() {
		return new Date(this._end)
	}

	get start() {
		return new Date(this._start)
	}

	get day() {
		return new Date(this._day)
	}
}

export default class Diary {
	lessons: Lesson[]

	constructor(diary: TLesson[]) {
		this.lessons = diary.map(lesson => new Lesson(lesson))
		// this.lessons.filter(lesson => typeof lesson.roomName !== 'string').map((lesson, i ,a) => {
		// 	a.find(l => typeof  l.roomName === 'string' && l.subjectName === lesson.subjectName)
		// })
	}

	forDay(date: Date | string) {
		if (date instanceof Date) date = date.toYYYYMMDD()
		return this.lessons.filter(lesson => lesson.day.toYYYYMMDD() === date)
	}

	forTime(date: Date) {
		return this.forDay(date).find(
			({ start, end }) => date >= start && date < end
		)
	}
}
