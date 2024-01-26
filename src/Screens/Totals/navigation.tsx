import { createStackNavigator } from '@react-navigation/stack'
import { LANG } from '../../Setup/constants'

export const S_SUBJECT_TOTALS = LANG['s_subject_totals']
export const S_TOTALS = LANG['s_totalsN']
export type ParamMap = {
	[S_TOTALS]: undefined
	[S_SUBJECT_TOTALS]: {
		termId: number
		finalMark: string | number | null
		subjectId: number
	}
}
export const Stack = createStackNavigator<ParamMap>()
