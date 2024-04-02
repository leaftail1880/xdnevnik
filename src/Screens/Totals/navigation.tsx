import { createStackNavigator } from '@react-navigation/stack'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { Education } from '../../NetSchool/classes'
import { LANG } from '../../Setup/constants'
import { EducationStore } from '../../Stores/NetSchool'
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
	schoolYear: Education['schoolyear'] | null = null
	years: { label: string; value: string; year: Education['schoolyear'] }[] = []

	constructor() {
		makeAutoObservable(this)
		autorun(() => {
			const { studentId } = Settings
			EducationStore.withParams({ studentId })

			const education = EducationStore.result
			runInAction(() => {
				if (education) {
					this.years = education
						.filter(e => !e.isAddSchool)
						.map(e => {
							const start = new Date(e.schoolyear.startDate).getFullYear()
							const end = new Date(e.schoolyear.endDate).getFullYear()
							const label = `${start}/${end}`
							return {
								label,
								value: e.schoolyear.id + '',
								year: e.schoolyear,
							}
						})
					if (!this.schoolYear) {
						this.schoolYear = toJS(
							education.find(e => !e.isAddSchool)?.schoolyear || null
						)
					}
				}
			})
		})
	}
})()