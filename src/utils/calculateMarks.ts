import type { PartialAssignment } from '~services/net-school/entities'
import { SubjectPerformance } from '~services/net-school/entities'
import { Logger } from '../constants'
export type CalculateTotals = Partial<Pick<SubjectPerformance, 'attendance'>> &
	Pick<SubjectPerformance, 'averageMark' | 'classmeetingsStats'> & {
		results: (Omit<
			SubjectPerformance['results'][number],
			'classMeetingDate' | 'classMeetingId' | 'result'
		> & {
			result: string | number | null
		})[]
	}

export function calculateMarks({
	totals,
	lessonsWithoutMark = false,
	customMarks = [],
	attendance: missedLessons = true,
}: {
	totals: CalculateTotals
	attendance?: boolean
	lessonsWithoutMark?: boolean
	customMarks?: Partial<PartialAssignment>[]
}) {
	try {
		let attendance: PartialAssignment[] = []
		if (missedLessons && totals.attendance) {
			attendance = attendance.concat(
				totals.attendance.map(e => {
					return {
						result: e.attendanceMark,
						assignmentId: e.classMeetingDate + e.attendanceMark,
						date: e.classMeetingDate,
					}
				}),
			)
		}

		let totalsAndSheduledTotals = [...attendance, ...totals.results].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		) as Partial<PartialAssignment>[]

		if (lessonsWithoutMark) {
			const length =
				totals.classmeetingsStats.passed -
				totals.results.length -
				attendance.length
			if (length > 0)
				attendance = new Array(length)
					.fill({
						result: 'Нет',
						assignmentTypeName: 'За этот урок оценки нет',
					})
					.concat(attendance)
		}

		let avgMark = totals.averageMark

		if (customMarks.length) {
			totalsAndSheduledTotals = totalsAndSheduledTotals.concat(customMarks)
			let totalWeight = 0
			let totalMark = 0

			for (const mark of [...totals.results, ...customMarks]) {
				if (mark && mark.weight && typeof mark.result === 'number') {
					totalWeight += mark.weight
					totalMark += mark.weight * mark.result
				}
			}

			avgMark = Number((totalMark / totalWeight).toFixed(2))
		}

		if (lessonsWithoutMark) {
			totalsAndSheduledTotals = totalsAndSheduledTotals.concat(
				new Array(
					totals.classmeetingsStats.scheduled - totalsAndSheduledTotals.length,
				).fill({}),
			)
		}

		const weights = totals.results.map(e => e.weight)
		const maxWeight = Math.max(...weights)
		const minWeight = Math.min(...weights)
		return { avgMark, totalsAndSheduledTotals, maxWeight, minWeight }
	} catch (e) {
		if (!(e + '').includes('TypeError: Cannot convert null value to object'))
			Logger.error('calcMarks', e)
	}
}
