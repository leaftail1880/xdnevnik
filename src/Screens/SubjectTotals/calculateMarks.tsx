import { SubjectPerformance } from '../../NetSchool/classes'
import { logger } from '../../Setup/constants'
import type { MarkInfo } from '../Totals'

export function calculateMarks({
	totals,
	lessonsWithoutMark = false,
	customMarks = [],
	missedLessons = true,
}: {
	totals: SubjectPerformance
	missedLessons?: boolean
	lessonsWithoutMark?: boolean
	customMarks?: Partial<MarkInfo>[]
}) {
	try {
		let attendance: MarkInfo[] = []
		if (missedLessons && totals.attendance) {
			attendance = attendance.concat(
				totals.attendance.map(e => {
					return {
						result: e.attendanceMark,
						assignmentId: e.classMeetingDate + e.attendanceMark,
						date: e.classMeetingDate,
					}
				})
			)
		}

		if (lessonsWithoutMark) {
			attendance = attendance.concat(
				new Array(
					totals.classmeetingsStats.passed -
						totals.results.length -
						attendance.length
				).fill({ result: 'Нет', assignmentTypeName: 'Урок прошел, оценки нет' })
			)
		}

		let totalsAndSheduledTotals = [...attendance, ...totals.results].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		) as Partial<MarkInfo>[]

		let avgMark = totals.averageMark

		if (customMarks.length) {
			totalsAndSheduledTotals = totalsAndSheduledTotals.concat(customMarks)
			let totalWeight = 0
			let totalMark = 0

			for (const mark of [
				...totals.results,
				...(customMarks as {
					weight: number
					result: number
				}[]),
			]) {
				totalWeight += mark.weight
				totalMark += mark.weight * mark.result
			}

			avgMark = Number((totalMark / totalWeight).toFixed(2))
		}

		if (lessonsWithoutMark) {
			totalsAndSheduledTotals = totalsAndSheduledTotals.concat(
				new Array(
					totals.classmeetingsStats.scheduled - totalsAndSheduledTotals.length
				).fill({})
			)
		}

		const weights = totals.results.map(e => e.weight)
		const maxWeight = Math.max(...weights)
		const minWeight = Math.min(...weights)
		return { avgMark, totalsAndSheduledTotals, maxWeight, minWeight }
	} catch (e) {
		if (!(e + '').includes('TypeError: Cannot convert null value to object'))
			logger.error('calcMarks', e)
	}
}
