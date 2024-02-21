import { createApiMethodStore } from './Async'
import { KeyStore } from './Key'

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
	studentId: number | undefined
	subjectId: number
}

export const StudentsStore = createApiMethodStore(
	'students',
	'списка учеников',
	{}
)
