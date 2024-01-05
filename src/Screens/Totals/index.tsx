import { StackScreenProps } from '@react-navigation/stack'
// import { TouchableOpacity } from 'react-native-gesture-handler'
// import Ionicons from 'react-native-vector-icons/Ionicons'
import { Observer, observer } from 'mobx-react-lite'
import { Switch, Text, View } from 'react-native-ui-lib'
import { Education, SubjectPerformance } from '../../NetSchool/classes'
import { Settings } from '../../Stores/Settings.store'
import { XDnevnik } from '../../Stores/Xdnevnik.store'
import { SubjectTotals } from '../SubjectTotals/index'
import { TotalsScreenTable } from './TotalsScreenTable'
import { TotalsScreenTerm } from './TotalsScreenTerm'
import { ParamMap, S_SUBJECT_TOTALS, S_TOTALS, Stack } from './navigation'
import { EducationStore, SubjectsStore, TotalsStore } from './stores'

export const TotalsNavigation = observer(function TotalsNavigation() {
	const { studentId } = XDnevnik
	EducationStore.withParams({ studentId })

	// TODO Let user to schoose school year
	const schoolYear = EducationStore.result?.find(
		e => !e.isAddSchool
	)?.schoolyear
	const schoolYearId = schoolYear && schoolYear.id

	SubjectsStore.withParams({ studentId, schoolYearId })
	TotalsStore.withParams({
		schoolYearId,
		studentId,
	})

	const TotalsScreen = Settings.currentTotalsOnly
		? TotalsScreenTerm
		: TotalsScreenTable
	return (
		<Stack.Navigator>
			<Stack.Screen
				name={S_TOTALS}
				options={{
					headerRight() {
						return (
							<Observer>
								{function headerSwitch() {
									return (
										<View flex row spread center padding-s1>
											<Text marginR-s2>Только одна четверть</Text>
											<Switch
												value={Settings.currentTotalsOnly}
												onValueChange={currentTotalsOnly =>
													Settings.save({ currentTotalsOnly })
												}
											/>
										</View>
									)
								}}
							</Observer>
						)
					},
				}}
			>
				{nav => <TotalsScreen {...nav} {...{ schoolYear }} />}
			</Stack.Screen>
			<Stack.Screen
				name={S_SUBJECT_TOTALS}
				options={{
					headerStyle: { elevation: 0 },
				}}
			>
				{nav => <SubjectTotals {...nav} />}
			</Stack.Screen>
		</Stack.Navigator>
	)
})

export type TotalsContext = {
	schoolYear: Education['schoolyear'] | undefined
} & StackScreenProps<ParamMap, typeof S_TOTALS>

export type MarkInfo = Partial<
	Omit<
		SubjectPerformance['results'][number],
		'result' | 'assignmentId' | 'date'
	>
> & {
	date: string
	result: 'Нет' | number | string
	assignmentId: string | number
}
