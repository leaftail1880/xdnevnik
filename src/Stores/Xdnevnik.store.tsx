import { makeAutoObservable } from 'mobx'
import { StudentsStore } from './API'
import { Settings } from './Settings'

class XDnevnikStore {
	get studentId() {
		const student =
			StudentsStore.result && StudentsStore.result[Settings.studentIndex]
		if (student) return student.studentId
	}

	status?:
		| {
				content: React.ReactNode
				error?: boolean
		  }
		| undefined = undefined

	showToast(toast: (typeof this)['status']) {
		this.status = toast
	}

	constructor() {
		makeAutoObservable(this, { studentId: false, status: true })
	}
}

export const XDnevnik = new XDnevnikStore()
