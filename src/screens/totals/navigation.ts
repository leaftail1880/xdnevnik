import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import { autorun, makeAutoObservable, runInAction, toJS } from 'mobx'
import { Settings } from '~models/settings'
import { Education } from '~services/net-school/entities'
import { EducationStore } from '~services/net-school/store'
import { LANG } from '../../constants'

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
	search = ''

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
							education.find(e => !e.isAddSchool)?.schoolyear || null,
						)
					}
				}
			})
		})
	}
})()

export type TotalsScreenParams = StackScreenProps<
	TermNavigationParamMap,
	typeof S_TOTALS
>
