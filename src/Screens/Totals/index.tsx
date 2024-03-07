import { StackScreenProps } from '@react-navigation/stack'
import { Observer, observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Chip } from 'react-native-paper'
import { Spacings } from '../../Components/Spacings'
import { Education, SubjectPerformance } from '../../NetSchool/classes'
import { EducationStore, SubjectsStore, TotalsStore } from '../../Stores/API'
import { Settings } from '../../Stores/Settings'
import { SubjectTotals } from '../SubjectTotals/index'
import { TotalsScreenTable } from './TotalsScreenTable'
import { TotalsScreenTerm } from './TotalsScreenTerm'
import { ParamMap, S_SUBJECT_TOTALS, S_TOTALS, Stack } from './navigation'

export default observer(function TotalsNavigation() {
	const { studentId } = Settings
	EducationStore.withParams({ studentId })

	// TODO Let user to choose school year
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
		<Stack.Navigator
			screenOptions={{
				animationEnabled: true,
				presentation: 'modal',
			}}
		>
			<Stack.Screen
				name={S_TOTALS}
				options={{
					headerRight() {
						return (
							<Observer>
								{function headerSwitch() {
									return (
										<View style={{ margin: Spacings.s2 }}>
											<Chip
												selected={!Settings.currentTotalsOnly}
												onPress={() =>
													Settings.save({
														currentTotalsOnly: !Settings.currentTotalsOnly,
													})
												}
											>
												Все четверти
											</Chip>
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
				component={SubjectTotals}
				name={S_SUBJECT_TOTALS}
			></Stack.Screen>
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
