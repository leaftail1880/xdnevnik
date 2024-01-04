import { makeAutoObservable } from 'mobx'
import { Settings } from './Settings.store'
import { StudentsStore } from './StudentsStore'

class XDnevnikStore {
	get studentId() {
		const students = StudentsStore.withoutParams()
		const student = students.result && students.result[Settings.studentIndex]
		if (student) return student.studentId
	}
	status?:
		| {
				content: React.ReactNode
				error: boolean
		  }
		| undefined

	constructor() {
		makeAutoObservable(this, { studentId: false, status: true })
	}
}

export const XDnevnik = new XDnevnikStore()
