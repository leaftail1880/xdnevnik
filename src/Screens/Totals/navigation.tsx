import { createStackNavigator } from '@react-navigation/stack'
import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { Education } from '../../NetSchool/classes'
import { LANG } from '../../Setup/constants'
import {
	EducationStore,
	SubjectsStore,
	TotalsStore,
} from '../../Stores/NetSchool'
import { Settings } from '../../Stores/Settings'

export const S_SUBJECT_TOTALS = LANG['s_subject_totals']
export const S_TOTALS = LANG['s_totalsN']
export type TermNavigationParamMap = {
	[S_TOTALS]: undefined
	[S_SUBJECT_TOTALS]: {
		termId: number
		finalMark: string | number | null
		subjectId: number
	}
}
export const Stack = createStackNavigator<TermNavigationParamMap>()

export const TotalsStateStore = new (class {
	schoolYear?: Education['schoolyear']

	constructor() {
		makeAutoObservable(this)
		autorun(() => {
			const { studentId } = Settings
			EducationStore.withParams({ studentId })

			runInAction(() => {
				this.schoolYear ??= EducationStore.result?.find(
					e => !e.isAddSchool
				)?.schoolyear
			})

			if (this.schoolYear) {
				const schoolYearId = this.schoolYear.id

				SubjectsStore.withParams({ studentId, schoolYearId })
				TotalsStore.withParams({
					schoolYearId,
					studentId,
				})
			}
		})
	}
})()