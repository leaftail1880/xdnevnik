import { StudentSettings } from '@/models/settings'
import { Lesson } from '@/services/net-school/lesson'
import { makeAutoObservable } from 'mobx'

export enum EditDiaryScreen {
	ReorderLessons,
	AddLesson,
	EditLesson,
}

export const EditDiaryState = new (class {
	constructor() {
		makeAutoObservable(this)
	}

	currentScreen?: EditDiaryScreen
})()

export function setLessonTimeOffset(
	lesson: Lesson,
	offset: number,
	studentSettings: StudentSettings,
) {
	let dayOrder = studentSettings.lessonOrder[lesson.offsetId]
	if (!dayOrder) {
		studentSettings.lessonOrder[lesson.offsetId] = {}
		dayOrder = studentSettings.lessonOrder[lesson.offsetId]
	}

	if (!dayOrder) throw new TypeError('Day order is undefined!')

	if (offset) {
		dayOrder[lesson.subjectId] = offset
	} else {
		delete dayOrder[lesson.subjectId]
		if (!Object.keys(dayOrder).length) {
			delete studentSettings.lessonOrder[lesson.offsetId]
		}
	}
	debug({ offset, s: lesson.subjectId })
}
