import { API } from '../../NetSchool/api'
import { APIStore } from '../../Stores/API.store'

export const EducationStore = new APIStore(
	API,
	'education',
	'данных об обучении'
)
export const SubjectsStore = new APIStore(API, 'subjects', 'списка предметов')
export const TotalsStore = new APIStore(API, 'totals', 'итоговых оценок')
