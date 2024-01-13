import { createApiMethodStore } from './API.store'
import { KeyStore } from './Key.store'

export const StudentsStore = createApiMethodStore(
	'students',
	'списка учеников',
	{}
)
export const EducationStore = createApiMethodStore(
	'education',
	'данных об обучении'
)
export const SubjectsStore = createApiMethodStore(
	'subjects',
	'списка предметов'
)
export const TotalsStore = createApiMethodStore('totals', 'итоговых оценок')
export const DiaryStore = createApiMethodStore('diary', 'дневника')
export const AssignmentsStore = createApiMethodStore('assignments', 'оценок')
export const AttachmentsStore = createApiMethodStore('attachments', 'файлов')
export const SubjectPerformanceStores = new KeyStore(
	(id: StoreID) => id.studentId + '|' + id.subjectId,
	(id: StoreID) =>
		createApiMethodStore('subjectPerformance', 'итогов по предмету', id)
)

interface StoreID {
	studentId?: number
	subjectId: number
}
