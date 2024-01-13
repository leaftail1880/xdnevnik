import { makeAutoObservable } from 'mobx'
import { StudentsStore } from './API.stores'
import { Settings } from './Settings.store'

class XDnevnikStore {
	get studentId() {
		const students = StudentsStore
		const student = students.result && students.result[Settings.studentIndex]
		if (student) return student.studentId
	}
	status?:
		| {
				content: React.ReactNode
				error: boolean
		  }
		| undefined = undefined

	constructor() {
		makeAutoObservable(this, { studentId: false, status: true })
	}
}

export const XDnevnik = new XDnevnikStore()