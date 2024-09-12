import {
	AdditionalDeps,
	AsyncMethod,
	AsyncState,
	AsyncStore,
	FunctionsFromObject,
} from '~models/async.store'
import { KeyStore } from '~models/key.store'
import { API } from './api'

export const StudentsStore = method('students', 'списка учеников', {})

export const EducationStore = method('education', 'данных об обучении')
export const SubjectsStore = method('subjects', 'списка предметов')
export const TotalsStore = method('totals', 'итоговых оценок')

export const DiaryStore = method('diary', 'дневника')
export const AssignmentsStore = method('assignments', 'оценок')
export const AttachmentsStore = method('attachments', 'файлов')

interface SubjectPerformanceStoreID {
	studentId: number | undefined
	subjectId: number
}

export const SubjectPerformanceStores = new KeyStore(
	(id: SubjectPerformanceStoreID) => id.studentId + '|' + id.subjectId,
	(id: SubjectPerformanceStoreID) =>
		method('subjectPerformance', 'итогов по предмету', id),
)

function method<
	MethodName extends keyof FunctionsFromObject<typeof API>,
	Fn = FunctionsFromObject<typeof API>[MethodName],
	FnReturn = Fn extends AsyncMethod ? Awaited<ReturnType<Fn>> : never,
	DefaultParams = Record<string, never>,
>(
	method: MethodName,
	name: string,
	defaultParams?: DefaultParams,
	additionalDeps?: () => AdditionalDeps,
	debug?: boolean,
) {
	const store = new AsyncStore(
		API,
		method,
		name,
		defaultParams,
		additionalDeps,
		debug,
	)
	return store as unknown as AsyncState<FnReturn> &
		Pick<typeof store, 'withParams'>
}

export const HomeworkMarksStore = method('homework', 'домашка')
