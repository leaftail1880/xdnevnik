import { roundMark } from '@/components/Mark'
import type { PartialAssignment } from '@/services/net-school/entities'
import { SubjectPerformance } from '@/services/net-school/entities'
import { Logger } from '../constants'

// TODO: Refactor and use class MarksCalculator instead of one big shitty function

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
	markRoundAdd,
}: {
	totals: CalculateTotals
	attendance?: boolean
	lessonsWithoutMark?: boolean
	customMarks?: Partial<PartialAssignment>[]
	defaultMark?: number
	defaultMarkWeight?: number
	targetMark?: number
	markRoundAdd: number
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
		) as PartialAssignment[]

		if (lessonsWithoutMark) {
			// TODO Fix
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
			// @ts-expect-error AAAAAAAAAAA
			totalsAndSheduledTotals = totalsAndSheduledTotals.concat(customMarks)
			avgMark = calculateAvg(customMarks, totals)
		}

		if (lessonsWithoutMark) {
			// TODO Fix
			totalsAndSheduledTotals = totalsAndSheduledTotals.concat(
				new Array(
					totals.classmeetingsStats.scheduled - totalsAndSheduledTotals.length,
				).fill({}),
			)
		}

		const toGetMarks: ToGetMarkTargetCalculated[] = []
		if (defaultMark && defaultMarkWeight && targetMark) {
			calculateToGetMark(
				avgMark,
				markRoundAdd,
				targetMark,
				totals,
				defaultMark,
				defaultMarkWeight,
				toGetMarks,
				customMarks,
			)
			toGetMarks.sort((a, b) => b.target - a.target)
		}

		// @ts-expect-error AAAAAAAAAAAA
		const weights = totals.results.concat(customMarks).map(e => e.weight)
		const maxWeight = Math.max(...weights)
		const minWeight = Math.min(...weights)
		return {
			avgMark,
			totalsAndSheduledTotals,
			maxWeight,
			minWeight,
			toGetMarks,
		}
	} catch (e) {
		if (!(e + '').includes('TypeError: Cannot convert null value to object'))
			Logger.error('calcMarks', e)
	}
}

function calculateToGetMark(
	avgMark: number,
	markRoundAdd: number,
	targetMark: number,
	totals: CalculateTotals,
	defaultMark: number,
	defaultMarkWeight: number,
	toGetMarks: ToGetMarkTargetCalculated[],
	customMarks: Partial<PartialAssignment>[],
) {
	const roundedAvg = roundMark(avgMark, markRoundAdd)
	if (roundedAvg >= targetMark) return

	const stats = totals.classmeetingsStats
	const remainingLessons = stats.scheduled - stats.passed

	for (let amount = 1; amount <= remainingLessons; amount++) {
		const avg = calculateAvg(
			new Array(amount)
				.fill({
					result: defaultMark,
					weight: defaultMarkWeight,
				} satisfies Partial<PartialAssignment>)
				.concat(customMarks),
			totals,
		)

		// Calculate for other possible mark targets too
		for (let target = roundedAvg + 1; target <= targetMark; target++) {
			if (roundMark(avg, markRoundAdd) >= target) {
				const highest = target === targetMark

				if (!toGetMarks.some(e => e.target === target)) {
					toGetMarks.push({ target, amount, highest })
				}
				if (highest) return
			}
		}
	}

	toGetMarks.push({ target: targetMark, amount: 0, highest: true })
}

export function calculateAvg(
	customMarks: Partial<Pick<PartialAssignment, 'weight' | 'result'>>[],
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

export interface ToGetMarkTargetCalculated {
	highest: boolean
	target: number
	amount: number
}
