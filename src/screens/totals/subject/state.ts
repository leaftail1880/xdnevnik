import { KeyStore } from '@/models/key.store'
import type { PartialAssignment } from '@/services/net-school/entities'
import { makeAutoObservable, ObservableSet } from 'mobx'

class SubjectTotalsStoreImpl {
	constructor() {
		makeAutoObservable(this)
	}

	collapsed = true
	attendance = false
	lessonsWithoutMark = false
	customMarks: PartialAssignment[] = []
	disabledTotalTypes = new ObservableSet<string | undefined>()
}

export const SubjectTotalsStates = new KeyStore<number, SubjectTotalsStoreImpl>(
	s => s.toString(),
	() => new SubjectTotalsStoreImpl(),
)
