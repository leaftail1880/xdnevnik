import { createApiMethodStore } from '../../Stores/API.store'

export const EducationStore = createApiMethodStore(
	'education',
	'данных об обучении'
)
export const SubjectsStore = createApiMethodStore(
	'subjects',
	'списка предметов'
)
export const TotalsStore = createApiMethodStore('totals', 'итоговых оценок')
