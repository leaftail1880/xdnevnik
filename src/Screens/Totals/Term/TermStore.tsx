import { makeAutoObservable } from 'mobx'
import { TotalsScreenParams } from '..'
import { NSEntity, Subject, Total } from '../../../NetSchool/classes'
import {
	SubjectPerformanceStores,
	TotalsStore,
} from '../../../Stores/NetSchool'
import { Settings } from '../../../Stores/Settings'

export const TermStore = new (class {
	sort = true
	attendance = false

	getTerms(totals = TotalsStore) {
		return totals.result?.[0]?.termTotals.map(total => ({
			label: total.term.name,
			value: total.term.id + '',
			term: total.term,
		}))
	}
	get totalsResult() {
		const selectedTerm = Settings.currentTerm
		if (!TotalsStore.result || !selectedTerm) return []

		if (this.sort)
			return TotalsStore.result
				.slice()
				.sort((a, b) => getTermSortValue(a) - getTermSortValue(b))
		return TotalsStore.result

		function getTermSortValue(
			total: Total,
			term = total.termTotals.find(e => e.term.id === selectedTerm!.id)
		) {
			if (!term) return 0

			let avg = term.avgMark ?? 0
			if (term.mark && !isNaN(Number(term.mark))) {
				avg = Number(term.mark)
			}

			const { store } = SubjectPerformanceStores.get(
				{
					studentId: Settings.studentId,
					subjectId: total.subjectId,
				},
				false
			)
			if (store.result?.results) avg += store.result?.results.length / 10000
			return avg
		}
	}
	constructor() {
		makeAutoObservable(this, { getTerms: false })
	}
})()

export type SubjectInfo = {
	total: Total
	selectedTerm: NSEntity
	attendance: boolean
	subjects: Subject[]
} & Pick<TotalsScreenParams, 'navigation'>
