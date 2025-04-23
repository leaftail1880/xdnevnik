import type { PartialAssignment } from '@/services/net-school/entities'
import { makeAutoObservable, ObservableSet } from 'mobx'

export const SubjectTotalsState = new (class SubjectTotalsStoreImpl {
	constructor() {
		makeAutoObservable(this)
	}

	collapsed = true
	attendance = false
	lessonsWithoutMark = false
	customMarks: PartialAssignment[] = []
	disabledTotalTypes = new ObservableSet<string | undefined>()
})()
