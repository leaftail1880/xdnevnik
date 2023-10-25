import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import { Alert, ScrollView, Text, TextStyle, View } from 'react-native'
// import { TouchableOpacity } from 'react-native-gesture-handler'
// import Ionicons from 'react-native-vector-icons/Ionicons'
import { useTheme } from '@react-navigation/native'
import { useContext, useState } from 'react'
import { Switch } from 'react-native-gesture-handler'
import { API } from '../NetSchool/api'
import { SubjectPerformance } from '../NetSchool/classes'
import { Loading } from '../components/loading'
import { Mark } from '../components/mark'
import { ACCENT_COLOR, LANG, SECONDARY_COLOR, styles } from '../constants'
import { useAPI } from '../hooks/api'
import { APP_CTX } from '../hooks/settings'
import { DisplayName } from './settings'

const S_SUBJECT_TOTALS = LANG['s_subject_totals']
const S_TOTALS = LANG['s_totalsN']
type ParamMap = {
	[S_TOTALS]: undefined
	[S_SUBJECT_TOTALS]: {
		termId: number
		finalMark: string | number | null
		subjectId: number
		studentId: number
	}
}

const Stack = createStackNavigator<ParamMap>()

export function TotalsNavigation(props: {fallbacks: {students: React.ReactNode, auth: React.ReactNode}}) {
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
			<Stack.Screen name={S_TOTALS}>
				{nav => props.fallbacks.auth || <TotalsScreen {...nav} />}
			</Stack.Screen>
			<Stack.Screen name={S_SUBJECT_TOTALS}>
				{nav => props.fallbacks.auth ||<SubjectTotals {...nav} />}
			</Stack.Screen>
		</Stack.Navigator>
	)
}

export function TotalsScreen(props: StackScreenProps<ParamMap, 'Оценки '>) {
	const theme = useTheme()
	const { studentId } = useContext(APP_CTX)
	const { result: education, fallback: FallbackEducation } = useAPI(
		API,
		'education',
		{ studentId },
		'данных об обучении'
	)

	// TODO Let user to schoose school year
	const schoolYear = education && education[0].schoolyear
	const schoolYearId = schoolYear && schoolYear.id

	const { result: subjects, fallback: FallbackSubjects } = useAPI(
		API,
		'subjects',
		{ studentId, schoolYearId },
		'списка предметов'
	)

	const {
		result: totals,
		updateDate,
		fallback: FallbackTotals,
	} = useAPI(
		API,
		'totals',
		{
			schoolYearId,
			studentId,
		},
		'итоговых оценок'
	)

	const headerWidth = 50
	const termTotalWidth =
		totals &&
		totals[0] &&
		(`${~~((100 - headerWidth) / totals[0].termTotals.length)}%` as const)

	return FallbackEducation ||
		FallbackSubjects ||
		FallbackTotals ||
		totals.length < 1 ? (
		<Loading text="Список оценок пуст" />
	) : (
		<ScrollView contentContainerStyle={styles.table}>
			{/* Table head */}
			<View style={{ ...styles.tableRow, backgroundColor: ACCENT_COLOR }}>
				{/* Table first row */}
				<Text style={{ ...styles.buttonText, width: `${headerWidth}%` }}>
					{new Date(schoolYear!.startDate).getFullYear()}/
					{new Date(schoolYear!.endDate).getFullYear()} Четверти
				</Text>

				{/* Table rows */}
				{totals[0].termTotals.map((_, i, a) => (
					<Text
						style={{ width: termTotalWidth, ...styles.buttonText }}
						key={i.toString()}
					>
						{i + 1}/{a.length}
					</Text>
				))}
			</View>

			{/* Table body */}
			{totals.map(total => (
				<View
					style={{ ...styles.tableRow, padding: 0 }}
					key={total.subjectId.toString()}
				>
					{/* Table first row */}
					<View
						style={{
							...styles.tableCell,
							width: `${headerWidth}%`,
						}}
					>
						<Text style={{ color: theme.colors.text }}>
							{(subjects &&
								subjects.find(subject => total.subjectId === subject.id)
									?.name) ??
								'Предмет404'}
						</Text>
					</View>

					{/* Table rows */}
					{total.termTotals.map((term, i) => (
						<Mark
							finalMark={term.mark}
							mark={term.avgMark}
							style={{
								...styles.tableCell,
								width: termTotalWidth,
							}}
							onPress={() => {
								props.navigation.navigate(LANG['s_subject_totals'], {
									termId: term.term.id,
									finalMark: term.mark,
									studentId: studentId!,
									subjectId: total.subjectId,
								})
							}}
							key={i.toString() + term.avgMark + term.term.name}
						/>
					))}
				</View>
			))}
			<Text style={{ color: theme.colors.text }}>{updateDate}</Text>
		</ScrollView>
	)
}

type Mark = Partial<
	Omit<SubjectPerformance['results'][number], 'result' | 'assignmentId'> & {
		result: 'Нет' | number | string
		assignmentId: string | number
	}
>

export function SubjectTotals({
	route,
}: StackScreenProps<ParamMap, (typeof LANG)['s_subject_totals']>) {
	const theme = useTheme()
	const { termId, subjectId, finalMark } = route.params ?? {}
	const { studentId, settings } = useContext(APP_CTX)
	const {
		result: totals,
		fallback: FallbackTotals,
		updateDate: totalsUpdateDate,
	} = useAPI(
		API,
		'subjectPerformance',
		{ termId, studentId, subjectId },
		'итогов по предмету'
	)
	const [lessonsWithoutMark, setLessonsWithoutMark] = useState(false)

	if (FallbackTotals) return FallbackTotals

	let missedMark = (totals.attendance ?? []).map(e => {
		return {
			result: e.attendanceMark,
			assignmentId: e.classMeetingDate + e.attendanceMark,
			date: e.classMeetingDate,
		}
	})

	if (lessonsWithoutMark) {
		missedMark = missedMark.concat(
			new Array(
				totals.classmeetingsStats.passed -
					totals.results.length -
					missedMark.length
			).fill({ result: 'Нет' })
		)
	}

	const noMark: Mark[] = new Array(
		totals.classmeetingsStats.scheduled - totals.classmeetingsStats.passed
	).fill({})

	const totalsAndSheduledTotals = (
		[...missedMark, ...totals.results].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		) as Mark[]
	).concat(noMark)
	const weights = totals.results.map(e => e.weight)
	const maxWeight = Math.max(...weights)
	const minWeight = Math.min(...weights)
	const textStyle: TextStyle = { fontSize: 15, color: theme.colors.text }

	return (
		<ScrollView>
			<View style={styles.stretch}>
				<Text style={{ ...textStyle, fontSize: 20, margin: 5 }}>
					{totals.subject.name}
				</Text>
				<Mark
					finalMark={finalMark}
					mark={totals.averageMark}
					style={{ height: 50, width: 60 }}
					textStyle={{ fontSize: 20 }}
				/>
			</View>
			<View style={styles.stretch}>
				<Text style={{ ...textStyle, flex: 1, flexDirection: 'row' }}>
					Уроки без оценок
				</Text>
				<Switch
					trackColor={{ false: SECONDARY_COLOR, true: ACCENT_COLOR }}
					onValueChange={setLessonsWithoutMark}
					value={lessonsWithoutMark}
				/>
			</View>
			<View style={{ padding: 3 }}>
				{totalsAndSheduledTotals.map((e, i) => (
					<View key={e.assignmentId ?? i.toString()} style={styles.stretch}>
						<Mark
							mark={e.result ?? null}
							markWeight={
								typeof e.weight === 'number' && {
									current: e.weight,
									max: maxWeight,
									min: minWeight,
								}
							}
							style={{
								height: 50,
								width: 50,
								...(e.result === 'Нет' ? { backgroundColor: '#88888857' } : {}),
							}}
							textStyle={{ fontSize: 17 }}
							onPress={() => {
								Alert.alert(
									e.assignmentTypeName + ' ' + e.result,
									`Вес: ${e.weight}${
										e.comment ? `Комментарий: ${e.comment}` : ''
									}`
								)
							}}
						/>
						<Text style={textStyle}>{e.assignmentTypeName}</Text>

						<Text style={textStyle}>
							{e.date && new Date(e.date).toLocaleDateString()}
						</Text>
					</View>
				))}
				<View style={styles.stretch}>
					<Text style={textStyle}>
						{DisplayName(totals.teachers[0].name, settings)}
					</Text>
					<Text style={textStyle}>
						Прошло уроков {totals.classmeetingsStats.passed}/
						{totals.classmeetingsStats.scheduled}
					</Text>
				</View>
				<View style={styles.stretch}>
					<Text style={textStyle}>
						Средний бал класса {totals.classAverageMark}
					</Text>
					<Text style={textStyle}>{totalsUpdateDate}</Text>
				</View>
			</View>
		</ScrollView>
	)
}
