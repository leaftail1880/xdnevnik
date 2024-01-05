import { createApiMethodStore } from './API.store'

export const StudentsStore = createApiMethodStore(
	'students',
	'списка учеников',
	{},
	undefined
)
