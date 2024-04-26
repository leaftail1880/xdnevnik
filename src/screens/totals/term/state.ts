import { makeAutoObservable } from 'mobx'
import { Settings } from '../../../models/settings'
import { NSEntity, Subject, Total } from '../../../services/NetSchool/entities'
import {
	SubjectPerformanceStores,
	TotalsStore,
} from '../../../services/NetSchool/store'
import { TotalsScreenParams } from '../navigation'

export const TermStore = new (class {
	sort = true
	attendance = false

	get terms() {
		return TotalsStore.result?.[0]?.termTotals.map(total => ({
			label: total.term.name,
			value: total.term.id + '',
			term: total.term,
		}))
	}

	get totalsResult() {
		if (
			!TotalsStore.result ||
			!TotalsStore.result.length ||
			!Settings.currentTerm
		) {
			return []
		}

		if (this.sort) {
			return TotalsStore.result
				.slice()
				.sort((a, b) => this.getOrder(a) - this.getOrder(b))
		}

		return TotalsStore.result
	}

	private getOrder(
		total: Total,
		term = total.termTotals.find(e => e.term.id === Settings.currentTerm!.id),
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
			false,
		)
		if (store.result?.results) avg += store.result?.results.length / 10000
		return avg
	}
	constructor() {
		makeAutoObservable<this, 'getOrder'>(this, {
			getOrder: false,
		})
	}
})()

export type SubjectInfo = {
	total: Total
	selectedTerm: NSEntity
	attendance: boolean
	subjects: Subject[]
} & Pick<TotalsScreenParams, 'navigation'>
