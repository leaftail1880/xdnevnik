import { makeReloadPersistable } from '@/utils/makePersistable'
import { makeAutoObservable } from 'mobx'

export const TermsScreenSettings = new (class {
	yearTotals = true

	constructor() {
		makeAutoObservable<this, string>(this, {})
		makeReloadPersistable(this, {
			name: 'termStore',
			properties: ['yearTotals'],
		})
	}
})()
