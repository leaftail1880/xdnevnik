import { getSubjectName } from '@/components/SubjectName'
import { Settings } from '@/models/settings'
import { Total } from '@/services/net-school/entities'
import {
	SubjectPerformanceStores,
	SubjectsStore,
	TotalsStore,
} from '@/services/net-school/store'
import { makeReloadPersistable } from '@/utils/makePersistable'
import { stringSimilarity } from '@/utils/search'
import { makeAutoObservable } from 'mobx'
import { ToGetMarkTargetCalculated } from '../../../utils/calculateMarks'
import { TotalsScreenParams, TotalsStateStore } from '../navigation'
import { getAttendance } from './AttendanceStatsChip'
import { getAttestation } from './AttestationStatsChip'
import { RenderSubject } from './screen'

export const TermStoreSortModes = [
	{ value: 'averageMark', label: 'Средний балл' },
	{ value: 'toGetMarkAmount', label: 'Кол-во для исправления' },
	{ value: 'markAmount', label: 'Кол-во оценок' },
	{ value: 'attendance', label: 'Посещаемость' },
	{ value: 'attestation', label: 'Аттестация' },
	{ value: 'none', label: 'Никак' },
] as const

export const TermStore = new (class {
	sortMode: (typeof TermStoreSortModes)[number]['value'] = 'averageMark'
	attendance = false
	shortStats = false
	toGetMark = true
	attendanceStats = true
	attestationStats = true

	get terms() {
		return TotalsStore.result?.[0]?.termTotals.map(total => ({
			label: total.term.name,
			value: total.term.id + '',
			term: total.term,
		}))
	}

	get currentTerm() {
		return (
			Settings.studentSettings?.currentTerm ??
			TotalsStore.result?.[0]?.termTotals[0].term
		)
	}

	get totalsResult() {
		if (
			!TotalsStore.result ||
			!TotalsStore.result.length ||
			!this.currentTerm
		) {
			return []
		}

		if (TotalsStateStore.search) {
			return TotalsStore.result
				.slice()
				.map(e => ({ element: e, order: this.getSearchOrder(e) }))
				.sort((a, b) => b.order - a.order)
				.map(e => e.element)
		}

		if (this.sortMode === 'averageMark') {
			return TotalsStore.result
				.slice()
				.sort(
					(a, b) => this.getAverageMarkOrder(a) - this.getAverageMarkOrder(b),
				)
		}

		if (this.sortMode === 'toGetMarkAmount') {
			return TotalsStore.result
				.slice()
				.sort((a, b) => this.getToGetMarkOrder(b) - this.getToGetMarkOrder(a))
		}

		if (this.sortMode === 'markAmount') {
			return TotalsStore.result
				.slice()
				.sort((a, b) => this.getMarkAmountOrder(a) - this.getMarkAmountOrder(b))
		}

		if (this.sortMode === 'attendance') {
			return TotalsStore.result
				.slice()
				.sort((a, b) => this.getAttendanceOrder(a) - this.getAttendanceOrder(b))
		}

		if (this.sortMode === 'attestation') {
			return TotalsStore.result
				.slice()
				.sort(
					(a, b) => this.getAttestationOrder(b) - this.getAttestationOrder(a),
				)
		}

		return TotalsStore.result
	}

	subjectGetMarks: Record<string, ToGetMarkTargetCalculated[] | undefined> = {}

	private getSearchOrder(total: Total) {
		const name = getSubjectName(
			SubjectsStore.result
				? { subjectId: total.subjectId, subjects: SubjectsStore.result }
				: { subjectId: total.subjectId, subjectName: '' },
		)
		return stringSimilarity(name, TotalsStateStore.search)
	}

	private getMarkAmountOrder(total: Total) {
		const { store } = SubjectPerformanceStores.get(
			{
				studentId: Settings.studentId,
				subjectId: total.subjectId,
			},
			false,
		)
		if (!store.result?.results) return 0
		let avg = store.result.results.length

		const term = total.termTotals.find(e => e.term.id === this.currentTerm!.id)
		if (!term) return 0

		if (term.avgMark) {
			avg += term.avgMark / 10000
		} else if (term.mark && !isNaN(Number(term.mark))) {
			avg += Number(term.mark) / 10000
		}

		return avg
	}

	private getToGetMarkOrder(a: Total) {
		const order = this.subjectGetMarks[a.subjectId]?.[0]?.amount ?? 0
		return order + (10000 - this.getAverageMarkOrder(a) * 0.0001)
	}

	private getAverageMarkOrder(
		total: Total,
		term = total.termTotals.find(e => e.term.id === this.currentTerm!.id),
	) {
		if (!term) return 0

		let avg = term.avgMark ?? 0
		if (term.mark && !isNaN(Number(term.mark))) {
			avg = Number(term.mark)
		}

		const { store } = SubjectPerformanceStores.get(
			{ studentId: Settings.studentId, subjectId: total.subjectId },
			false,
		)
		if (store.result?.results) avg += store.result?.results.length / 10000
		return avg
	}

	private getAttendanceOrder(total: Total) {
		const { store } = SubjectPerformanceStores.get(
			{ studentId: Settings.studentId, subjectId: total.subjectId },
			false,
		)
		if (!store.result?.results) return 0

		const { attendance } = getAttendance(
			store.result,
			store.result.classmeetingsStats,
		)

		return attendance
	}

	private getAttestationOrder(total: Total) {
		const { store } = SubjectPerformanceStores.get(
			{ studentId: Settings.studentId, subjectId: total.subjectId },
			false,
		)
		if (!store.result?.results) return 0

		const settings = Settings.forStudentOrThrow()
		const { attestation } = getAttestation(settings, store.result)

		return attestation
	}

	constructor() {
		makeAutoObservable<this, string>(this, {
			getAverageMarkOrder: false,
			getToGetMarkOrder: false,
			getMarkAmountOrder: false,
			getSearchOrder: false,
		})
		makeReloadPersistable(this, {
			name: 'termStore',
			properties: ['sortMode', 'attendance', 'shortStats', 'attendanceStats'],
		})
	}
})()

export type SubjectInfo = Parameters<RenderSubject>[0] & {
	attendance: boolean
} & Pick<TotalsScreenParams, 'navigation'>
