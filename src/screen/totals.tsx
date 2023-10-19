import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import { ScrollView, Text, View } from 'react-native'
// import { TouchableOpacity } from 'react-native-gesture-handler'
// import Ionicons from 'react-native-vector-icons/Ionicons'
import { API } from '../NetSchool/api'
import { SubjectPerformance } from '../NetSchool/classes'
import { Mark } from '../components/mark'
import { ACCENT_COLOR, LANG, STYLES } from '../constants'
import { useAsync } from '../hooks/async'

const ParamMapObj = {
	[`${LANG['s_totals']} ` as const]: void 0,
	[LANG['s_subject_totals']]: {} as SubjectTotalsRouteParams,
}
type ParamMap = typeof ParamMapObj

type TotalsNavigationProps = { ctx: { studentId?: number } }

const Stack = createStackNavigator<ParamMap>()

export function TotalsNavigation(props: TotalsNavigationProps) {
	return (
		<Stack.Navigator
		// screenOptions={({ navigation }) => {
		// 	return {
		// 		headerLeft(props) {
		// 			return (
		// 				<TouchableOpacity onPress={() => navigation.goBack()}>
		// 					<Ionicons name="chevron-back" {...props} />
		// 				</TouchableOpacity>
		// 			)
		// 		},
		// 	}
		// }}
		>
			<Stack.Screen name={`${LANG['s_totals']} `}>
				{nav => <TotalsScreen {...props} {...nav} />}
			</Stack.Screen>
			<Stack.Screen name={LANG['s_subject_totals']}>
				{nav => <SubjectTotals {...nav} />}
			</Stack.Screen>
		</Stack.Navigator>
	)
}

export function TotalsScreen(
	props: TotalsNavigationProps & StackScreenProps<ParamMap, 'Оценки '>
) {
	const { studentId } = props.ctx
	const [education, FallbackEducation] = useAsync(
		() => API.education({ studentId: studentId! }),
		'данных об обучении',
		[API.changes, studentId]
	)

	// TODO Let user to schoose school year
	const schoolYear = education && education[0].schoolyear
	const schoolYearId = schoolYear && schoolYear.id

	const [subjects, FallbackSubjects] = useAsync(
		() => API.subjects({ studentId: studentId!, schoolYearId: schoolYearId! }),
		'списка предметов',
		[API.changes, studentId, schoolYearId]
	)

	const [totals, FallbackTotals] = useAsync(
		() => API.totals({ studentId: studentId!, schoolYearId: schoolYearId! }),
		'итоговых оценок',
		[API.changes, studentId, schoolYearId]
	)

	const headerWidth = 50
	const termTotalWidth =
		totals &&
		(`${~~((100 - headerWidth) / totals[0].termTotals.length)}%` as const)

	return (
		FallbackEducation ||
		FallbackSubjects ||
		FallbackTotals || (
			<ScrollView contentContainerStyle={STYLES.table}>
				{/* Table head */}
				<View style={{ ...STYLES.tableRow, backgroundColor: ACCENT_COLOR }}>
					{/* Table first row */}
					<Text style={{ ...STYLES.buttonText, width: `${headerWidth}%` }}>
						{new Date(schoolYear!.startDate).getFullYear()}/
						{new Date(schoolYear!.endDate).getFullYear()} Четверти
					</Text>

					{/* Table rows */}
					{totals[0].termTotals.map((_, i, a) => (
						<Text
							style={{ width: termTotalWidth, ...STYLES.buttonText }}
							key={i.toString()}
						>
							{i + 1}/{a.length}
						</Text>
					))}
				</View>

				{/* Table body */}
				{totals.map(total => (
					<View
						style={{ ...STYLES.tableRow, padding: 0 }}
						key={total.subjectId.toString()}
					>
						{/* Table first row */}
						<View
							style={{
								...STYLES.tableCell,
								width: `${headerWidth}%`,
							}}
						>
							<Text>
								{(subjects &&
									subjects.find(subject => total.subjectId === subject.id)
										?.name) ??
									'Предмет404'}
							</Text>
						</View>

						{/* Table rows */}
						{total.termTotals.map((term, i) => (
							<Mark
								mark={term.avgMark}
								style={{
									...STYLES.tableCell,
									width: termTotalWidth,
								}}
								onPress={() => {
									props.navigation.navigate(LANG['s_subject_totals'], {
										termId: term.term.id,
										studentId: studentId!,
										subjectId: total.subjectId,
									})
								}}
								key={i.toString() + term.avgMark + term.term.name}
							/>
						))}
					</View>
				))}
			</ScrollView>
		)
	)
}

interface SubjectTotalsRouteParams {
	termId: number
	subjectId: number
	studentId: number
}

export function SubjectTotals({
	route,
}: StackScreenProps<ParamMap, (typeof LANG)['s_subject_totals']>) {
	const { termId, studentId, subjectId } = route.params ?? {}
	const [totals, FallbackTotals] = useAsync(
		() => API.subjectPerformance({ termId, studentId, subjectId }),
		'итогов по предмету',
		[termId, studentId, subjectId]
	)

	if (FallbackTotals) return FallbackTotals

	const totalsAndSheduledTotals = [
		...new Array(totals.classmeetingsStats.passed - totals.results.length).fill(
			{ result: 'Нет' }
		),
		...totals.results,
		...new Array(
			totals.classmeetingsStats.scheduled - totals.classmeetingsStats.passed
		).fill({}),
	] as (
		| (Omit<SubjectPerformance['results'][number], 'result'> & {
				result: 'Нет' | number
		  })
		| Record<string, null>
	)[]

	if (totals.attendance) console.log(JSON.stringify(totals.attendance, null, 2))

	const weights = totals.results.map(e => e.weight)
	const maxWeight = Math.max(...weights)
	const minWeight = Math.min(...weights)

	return (
		<ScrollView>
			<View style={STYLES.stretch}>
				<Text style={{ fontSize: 20, margin: 5 }}>{totals.subject.name}</Text>
				<Mark
					mark={totals.averageMark}
					style={{ height: 50, width: 60 }}
					textStyle={{ fontSize: 20 }}
				/>
			</View>
			<ScrollView
				contentContainerStyle={STYLES.stretch}
				horizontal
				pagingEnabled
			>
				{totalsAndSheduledTotals.map((e, i) => (
					<Mark
						mark={e.result}
						markWeight={
							typeof e.weight === 'number' && {
								current: e.weight,
								max: maxWeight,
								min: minWeight,
							}
						}
						key={e.assignmentId ?? i.toString()}
						style={{
							minHeight: 30,
							minWidth: 30,
							...(e.result === 'Нет' ? { backgroundColor: '#88888857' } : {}),
						}}
					/>
				))}
			</ScrollView>
			<View style={STYLES.stretch}>
				<Text style={{ fontSize: 15 }}>{totals.teachers[0].name}</Text>
				<Text style={{ fontSize: 15 }}>
					Прошло уроков {totals.classmeetingsStats.passed}/
					{totals.classmeetingsStats.scheduled}
				</Text>
			</View>
			<View style={STYLES.stretch}>
				<Text style={{ fontSize: 15 }}>
					Средний бал класса {totals.classAverageMark}
				</Text>
			</View>
		</ScrollView>
	)
}
