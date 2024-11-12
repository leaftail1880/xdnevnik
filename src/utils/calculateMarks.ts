import { roundMark } from '~components/Mark'
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
			classMeetingDate?: string
		})[]
	}

export function calculateMarks({
	totals,
	lessonsWithoutMark = false,
	customMarks = [],
	attendance: missedLessons = true,
	defaultMark,
	defaultMarkWeight,
	targetMark,
}: {
	totals: CalculateTotals
	attendance?: boolean
	lessonsWithoutMark?: boolean
	customMarks?: Partial<PartialAssignment>[]
	defaultMark?: number
	defaultMarkWeight?: number
	targetMark?: number
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
			(a, b) =>
				new Date(a.classMeetingDate ?? a.date).getTime() -
				new Date(b.classMeetingDate ?? b.date).getTime(),
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
			avgMark = calculateAvg(customMarks, totals)
		}

		if (lessonsWithoutMark) {
			totalsAndSheduledTotals = totalsAndSheduledTotals.concat(
				new Array(
					totals.classmeetingsStats.scheduled - totalsAndSheduledTotals.length,
				).fill({}),
			)
		}

		let toGetTarget: number | undefined
		if (
			defaultMark &&
			defaultMarkWeight &&
			targetMark &&
			roundMark(avgMark) < targetMark
		) {
			const remainingLessons =
				totals.classmeetingsStats.scheduled - totals.classmeetingsStats.passed
			for (let i = 1; i <= remainingLessons; i++) {
				const avg = calculateAvg(
					new Array(i).fill({
						result: defaultMark,
						weight: defaultMarkWeight,
					} satisfies Partial<PartialAssignment>),
					totals,
				)
				if (roundMark(avg) >= targetMark) {
					toGetTarget = i
					break
				}
			}
		}

		const weights = totals.results.map(e => e.weight)
		const maxWeight = Math.max(...weights)
		const minWeight = Math.min(...weights)
		return {
			avgMark,
			totalsAndSheduledTotals,
			maxWeight,
			minWeight,
			toGetTarget,
		}
	} catch (e) {
		if (!(e + '').includes('TypeError: Cannot convert null value to object'))
			Logger.error('calcMarks', e)
	}
}
function calculateAvg(
	customMarks: Partial<PartialAssignment>[],
	totals: CalculateTotals,
) {
	let totalWeight = 0
	let totalMark = 0

	for (const mark of [...totals.results, ...customMarks]) {
		if (mark && mark.weight && typeof mark.result === 'number') {
			totalWeight += mark.weight
			totalMark += mark.weight * mark.result
		}
	}

	return Number((totalMark / totalWeight).toFixed(2))
}
