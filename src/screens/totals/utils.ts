import { Subject, Total } from '@/services/net-school/entities'

/**
 * @deprecated Make SubjectTotals store provide .filteredTotals and .totals and make this filter happen there
 */
export function removeNonExistentLessons(totals: Total[], subjects: Subject[]) {
	return totals.filter(e => subjects.some(s => s.id === e.subjectId))
}
