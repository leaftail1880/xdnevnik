import { API } from '../NetSchool/api'
import { APIStore } from './API.store'

export const StudentsStore = new APIStore(
	API,
	'students',
	'списка учеников',
	{},
	undefined
	// true
)
