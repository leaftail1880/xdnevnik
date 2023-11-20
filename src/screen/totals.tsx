import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import { Alert, ScrollView, Text, TextStyle, View } from 'react-native'
// import { TouchableOpacity } from 'react-native-gesture-handler'
// import Ionicons from 'react-native-vector-icons/Ionicons'
import { useTheme } from '@react-navigation/native'
import { useContext, useEffect, useState } from 'react'
import { Switch } from 'react-native-gesture-handler'
import { API } from '../NetSchool/api'
import {
	Education,
	NSEntity,
	Subject,
	SubjectPerformance,
	Total,
} from '../NetSchool/classes'
import { Dropdown } from '../components/dropdown'
import { Loading } from '../components/loading'
import { Mark } from '../components/mark'
import {
	ACCENT_COLOR,
	BUTTON_TEXT_COLOR,
	LANG,
	SECONDARY_COLOR,
	styles,
} from '../constants'
import { APIState, useAPI } from '../hooks/api'
import { Ctx } from '../hooks/settings'
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

// TODO Memo subj perf

const Stack = createStackNavigator<ParamMap>()

export function TotalsNavigation() {
	const theme = useTheme()
	const textStyle = { fontSize: 15, color: theme.colors.text }
	const { studentId, settings } = useContext(Ctx)
	const education = useAPI(
		API,
		'education',
		{ studentId },
		'данных об обучении'
	)

	// TODO Let user to schoose school year
	const schoolYear = education.result && education.result[0].schoolyear
	const schoolYearId = schoolYear && schoolYear.id

	const subjects = useAPI(
		API,
		'subjects',
		{ studentId, schoolYearId },
		'списка предметов'
	)

	const totals = useAPI(
		API,
		'totals',
		{
			schoolYearId,
			studentId,
		},
		'итоговых оценок'
	)

	const TotalsScreen = settings.currentTotalsOnly
		? TotalsScreenTerm
		: TotalsScreenTable
	return (
		<Stack.Navigator>
			<Stack.Screen
				name={S_TOTALS}
				options={{
					headerRight() {
						return (
							<View style={[styles.stretch, { padding: 3 }]}>
								<Text style={textStyle}>Только одна четверть</Text>
								<Switch
									trackColor={{ false: SECONDARY_COLOR, true: ACCENT_COLOR }}
									thumbColor={
										settings.currentTotalsOnly
											? ACCENT_COLOR
											: BUTTON_TEXT_COLOR
									}
									onValueChange={currentTotalsOnly =>
										settings.save({ currentTotalsOnly })
									}
									value={settings.currentTotalsOnly}
								/>
							</View>
						)
					},
				}}
			>
				{nav => (
					<TotalsScreen
						{...nav}
						{...{ subjects, totals, education, schoolYear }}
					/>
				)}
			</Stack.Screen>
			<Stack.Screen name={S_SUBJECT_TOTALS}>
				{nav => <SubjectTotals {...nav} />}
			</Stack.Screen>
		</Stack.Navigator>
	)
}

type TotalsContext = {
	education: APIState<Education[]>
	subjects: APIState<Subject[]>
	totals: APIState<Total[]>
	schoolYear: Education['schoolyear'] | undefined
}

export function TotalsScreenTerm({
	education,
	subjects,
	totals,
}: TotalsContext) {
	const theme = useTheme()
	const { settings } = useContext(Ctx)
	const terms = totals.result?.[0]?.termTotals.map(e => e.term)
	const [selectedTerm, setSelectedTerm] = useState<NSEntity>()
	useEffect(() => {
		if (terms && !selectedTerm) {
			if (settings.selectedTerm)
				setSelectedTerm(terms.find(e => e.id === settings.selectedTerm))
			else setSelectedTerm(terms[0])
		}
	}, [terms, selectedTerm, settings.selectedTerm])

	return education.fallback ||
		subjects.fallback ||
		totals.fallback ||
		totals.result.length < 1 ? (
		<Loading text="Загрузка из кэша{dots}" />
	) : (
		<ScrollView contentContainerStyle={{ alignItems: 'center' }}>
			{terms && (
				<Dropdown
					data={terms}
					defaultValue={selectedTerm}
					onSelect={v => {
						settings.save({ selectedTerm: v.id })
						setSelectedTerm(v)
					}}
					dropdownStyle={{ alignSelf: 'center', maxWidth: 110 }}
					buttonStyle={styles.dropdown}
					buttonTextStyle={styles.buttonText}
					defaultButtonText={selectedTerm?.name ?? 'Выбери четверть'}
					buttonTextAfterSelection={i => i?.name ?? 'F'}
					rowTextForSelection={i => i?.name ?? 'F'}
				/>
			)}
			{selectedTerm &&
				totals.result.map(total => (
					<SubjectPerformanceInline
						total={total}
						selectedTerm={selectedTerm}
						subjects={subjects.result}
						key={total.subjectId.toString()}
					/>
				))}
			<Text style={{ color: theme.colors.text }}>{totals.updateDate}</Text>
		</ScrollView>
	)
}

function SubjectPerformanceInline(props: {
	total: Total
	selectedTerm: NSEntity
	subjects: Subject[]
}) {
	const term = props.total.termTotals.find(
		e => e.term.id === props.selectedTerm.id
	)
	const { studentId } = useContext(Ctx)
	const assignments = useAPI(
		API,
		'subjectPerformance',
		{
			studentId: studentId!,
			subjectId: props.total.subjectId,
			termId: props.selectedTerm.id,
		},
		getSubjectName(props.subjects, props.total.subjectId)
	)

	return (
		<View style={{ margin: 5, width: '100%', padding: 5 }}>
			<View
				style={{
					alignSelf: 'flex-end',
					alignItems: 'flex-end',
					padding: 5,
					borderRadius: 5,
					maxHeight: 40,
					width: '100%',
					backgroundColor: ACCENT_COLOR,
				}}
			>
				<Text
					style={{
						fontSize: 16,
						fontWeight: 'bold',
					}}
				>
					{getSubjectName(props.subjects, props.total.subjectId)}
				</Text>
			</View>
			<View style={styles.stretch}>
				{assignments.fallback ||
					(() => {
						const weights = assignments.result.results.map(e => e.weight)
						const maxWeight = Math.max(...weights)
						const minWeight = Math.min(...weights)

						return (
							<ScrollView
								horizontal
								style={{ maxHeight: 100, margin: 0, minWidth: 100 }}
							>
								{assignments.result.results.map(e => (
									<Mark
										mark={e.result ?? 'Нет'}
										markWeight={{
											max: maxWeight,
											min: minWeight,
											current: e.weight,
										}}
										style={{ height: 50, width: 50 }}
										key={e.assignmentId}
									/>
								))}
							</ScrollView>
						)
					})()}

				{term && (
					<Mark
						finalMark={term?.mark}
						mark={term.avgMark}
						style={{ height: 50, width: 50 }}
					/>
				)}
			</View>
		</View>
	)
}

function getSubjectName(subjects: Subject[], subjectId: number) {
	return (
		subjects.find(subject => subjectId === subject.id)?.name ?? 'Предмет404'
	)
}

export function TotalsScreenTable(
	props: StackScreenProps<ParamMap, 'Оценки '> & TotalsContext
) {
	const theme = useTheme()
	const { studentId } = useContext(Ctx)
	const { education, subjects, totals, schoolYear } = props
	const headerWidth = 50
	const termTotalWidth =
		totals.result &&
		totals.result[0] &&
		(`${~~(
			(100 - headerWidth) /
			totals.result[0].termTotals.length
		)}%` as const)

	return education.fallback ||
		subjects.fallback ||
		totals.fallback ||
		totals.result.length < 1 ? (
		<Loading text="Загрузка из кэша{dots}" />
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
				{totals.result[0].termTotals.map((_, i, a) => (
					<Text
						style={{ width: termTotalWidth, ...styles.buttonText }}
						key={i.toString()}
					>
						{i + 1}/{a.length}
					</Text>
				))}
			</View>

			{/* Table body */}
			{totals.result.map(total => (
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
							{(subjects.result &&
								subjects.result.find(subject => total.subjectId === subject.id)
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
			<Text style={{ color: theme.colors.text }}>{totals.updateDate}</Text>
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
	const { studentId, settings } = useContext(Ctx)
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
