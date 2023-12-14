import { StackScreenProps, createStackNavigator } from '@react-navigation/stack'
import { ScrollView, StyleProp, ViewStyle } from 'react-native'
import { SubjectName, getSubjectName } from '../components/SubjectName'
// import { TouchableOpacity } from 'react-native-gesture-handler'
// import Ionicons from 'react-native-vector-icons/Ionicons'
import { memo, useContext, useEffect, useState } from 'react'
import {
	BorderRadiuses,
	Colors,
	Fader,
	FaderPosition,
	Spacings,
	Switch,
	Text,
	View,
} from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import {
	Education,
	NSEntity,
	Subject,
	SubjectPerformance,
	Total,
} from '../NetSchool/classes'
import { Dropdown } from '../components/Dropdown'
import { Loading } from '../components/Loading'
import { Mark } from '../components/Mark'
import { LANG, styles } from '../constants'
import { APIState, useAPI } from '../hooks/api'
import { Ctx } from '../hooks/settings'
import {
	SubjectTotals,
	caclulateMarks as calculateMarks,
} from './subjectTotals'

const S_SUBJECT_TOTALS = LANG['s_subject_totals']
const S_TOTALS = LANG['s_totalsN']
export type ParamMap = {
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
	const { studentId, settings } = useContext(Ctx)
	const education = useAPI(
		API,
		'education',
		{ studentId },
		'данных об обучении'
	)

	// TODO Let user to schoose school year
	const schoolYear =
		education.result && education.result.find(e => !e.isAddSchool)?.schoolyear
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
							<View flex row spread center padding-s1>
								<Text marginR-s2>Только одна четверть</Text>
								<Switch
									value={settings.currentTotalsOnly}
									onValueChange={currentTotalsOnly =>
										settings.save({ currentTotalsOnly })
									}
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
}

type TotalsContext = {
	education: APIState<Education[]>
	subjects: APIState<Subject[]>
	totals: APIState<Total[]>
	schoolYear: Education['schoolyear'] | undefined
} & StackScreenProps<ParamMap, typeof S_TOTALS>

export function TotalsScreenTerm({
	education,
	subjects,
	totals,
	navigation,
}: TotalsContext) {
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

	const [sort, setSort] = useState(true)
	const [attendance, setAttendance] = useState(false)
	if (sort && totals.result && selectedTerm) {
		totals.result.sort(
			(a, b) =>
				getTermSortValue(a, selectedTerm) - getTermSortValue(b, selectedTerm)
		)
	}

	return (
		education.fallback ||
		subjects.fallback ||
		totals.fallback || (
			<ScrollView
				contentContainerStyle={{ alignItems: 'center' }}
				refreshControl={totals.refreshControl}
			>
				{terms && (
					<Dropdown
						data={terms}
						defaultValue={selectedTerm}
						onSelect={v => {
							settings.save({ selectedTerm: v.id })
							setSelectedTerm(v)
						}}
						dropdownStyle={{ maxWidth: 110 }}
						defaultButtonText={selectedTerm?.name ?? 'Выбери четверть'}
						buttonTextAfterSelection={i => i?.name ?? 'F'}
						rowTextForSelection={i => i?.name ?? 'F'}
					/>
				)}
				<View flex style={{ width: '90%' }}>
					<View flex row spread padding-s1>
						<Text margin-s1>Вначале плохие оценки</Text>
						<Switch margin-s1 onValueChange={setSort} value={sort} />
					</View>
					<View flex row spread padding-s1>
						<Text margin-s1>Пропуски</Text>
						<Switch
							margin-s1
							onValueChange={setAttendance}
							value={attendance}
						/>
					</View>
				</View>
				{totals.result.length < 1 ? (
					<Loading text="Загрузка из кэша{dots}" />
				) : (
					selectedTerm &&
					totals.result.map(total => (
						<SubjectPerformanceInline
							attendance={attendance}
							navigation={navigation}
							total={total}
							selectedTerm={selectedTerm}
							subjects={subjects.result}
							key={total.subjectId.toString()}
						/>
					))
				)}
				<Text $textDisabled center margin-s1>
					{totals.updateDate}
				</Text>
			</ScrollView>
		)
	)
}

type SubjectInfo = {
	total: Total
	selectedTerm: NSEntity
	attendance: boolean
	subjects: Subject[]
} & Pick<TotalsContext, 'navigation'>

function getTermSortValue(total: Total, selectedTerm: NSEntity) {
	const term = total.termTotals.find(e => e.term.id === selectedTerm.id)
	if (!term) return 0

	let avg = term.avgMark ?? 0
	if (term.mark && !isNaN(Number(term.mark))) {
		avg = Number(term.mark)
	}

	// TODO use context for subjectPerformance and sort depending on marks count
	// const resultCount = term

	return avg
}

function SubjectPerformanceInline(props: SubjectInfo) {
	const { studentId } = useContext(Ctx)
	const term = props.total.termTotals.find(
		e => e.term.id === props.selectedTerm.id
	)

	if (!term) return <Loading text="Загрузка четверти{dots}" />

	const openDetails = () =>
		props.navigation.navigate(LANG['s_subject_totals'], {
			termId: props.selectedTerm.id,
			finalMark: term.mark,
			studentId: studentId!,
			subjectId: props.total.subjectId,
		})

	return (
		<View
			br20
			margin-s2
			style={{
				elevation: 10,
				width: '98%',
				backgroundColor: Colors.$backgroundPrimaryMedium,
			}}
		>
			<View
				padding-s1
				br20
				style={{
					alignSelf: 'flex-end',
					alignItems: 'flex-end',
					width: '100%',
					elevation: 10,
					backgroundColor: Colors.$backgroundPrimaryLight,
				}}
			>
				<SubjectName
					subjectId={props.total.subjectId}
					subjects={props.subjects}
					iconsSize={18}
					style={{
						fontSize: 18,
						color: Colors.$textDefault,
						fontWeight: 'bold',
					}}
				/>
			</View>
			{term ? (
				<View flex row style={{ width: '100%' }}>
					<View flex row style={{ alignItems: 'flex-end' }}>
						<Fader
							position={FaderPosition.START}
							size={30}
							tintColor={Colors.$backgroundAccent}
						/>

						<SubjectMarksInline
							{...props}
							openDetails={openDetails}
							term={term}
						/>
						<Fader
							size={30}
							tintColor={Colors.rgba(Colors.$backgroundAccent, 0.5)}
						/>
						<Fader
							size={15}
							tintColor={Colors.rgba(Colors.$backgroundAccent, 0.5)}
						/>
						<Fader
							size={7}
							tintColor={Colors.rgba(Colors.$backgroundAccent, 1)}
						/>
					</View>
					<View
						row
						spread
						backgroundColor={Colors.$backgroundAccent}
						padding-s1
						style={{ borderBottomRightRadius: BorderRadiuses.br20 }}
					>
						<Mark
							duty={false}
							noColor={Colors.$backgroundDefault}
							finalMark={term?.mark}
							mark={term.avgMark}
							onPress={openDetails}
							style={{ height: 50, width: 50, alignSelf: 'center' }}
						/>
					</View>
				</View>
			) : (
				<Loading />
			)}
		</View>
	)
}
const SubjectMarksInline = memo(
	function SubjectMarksInline(
		props: SubjectInfo & {
			term: Total['termTotals'][number]
			openDetails: () => void
		}
	) {
		const { studentId, settings } = useContext(Ctx)

		const assignments = useAPI(
			API,
			'subjectPerformance',
			{
				studentId: studentId!,
				subjectId: props.total.subjectId,
				termId: props.selectedTerm.id,
			},
			getSubjectName({
				subjects: props.subjects,
				subjectId: props.total.subjectId,
				settings,
				studentId: studentId!,
			})
		)

		const viewStyle: StyleProp<ViewStyle> = {
			height: '100%',
			margin: 0,
			width: '100%',
			alignSelf: 'center',
			backgroundColor: Colors.$backgroundPrimaryMedium,
		}
		const containerStyle: StyleProp<ViewStyle> = {
			padding: Spacings.s1,
			alignItems: 'center',
		}

		if (assignments.fallback)
			return (
				<View style={[viewStyle, containerStyle]}>{assignments.fallback}</View>
			)

		const marks = calculateMarks({
			totals: assignments.result,
			missedLessons: props.attendance,
		})
		if (!marks)
			return (
				<View style={[viewStyle, containerStyle]}>
					<Loading />
				</View>
			)

		const { totalsAndSheduledTotals, maxWeight, minWeight } = marks

		if (totalsAndSheduledTotals.length === 0)
			return (
				<View centerV style={[viewStyle, containerStyle]}>
					<Text>Оценок нет</Text>
				</View>
			)

		return (
			<ScrollView
				horizontal
				style={viewStyle}
				contentContainerStyle={containerStyle}
				snapToAlignment="end"
			>
				{totalsAndSheduledTotals.map(e => (
					<Mark
						duty={e.duty ?? false}
						mark={e.result ?? 'Нет'}
						markWeight={
							e.weight
								? {
										max: maxWeight,
										min: minWeight,
										current: e.weight,
								  }
								: void 0
						}
						style={{ height: 50, width: 50 }}
						key={e.assignmentId}
						onPress={props.openDetails}
					/>
				))}
			</ScrollView>
		)
	},
	(prev, curr) =>
		prev.term.term.id === curr.term.term.id &&
		prev.subjects.length === curr.subjects.length &&
		prev.total.subjectId === curr.total.subjectId &&
		prev.attendance === curr.attendance
)

export function TotalsScreenTable(props: TotalsContext) {
	const { studentId } = useContext(Ctx)
	const { education, subjects, totals, schoolYear } = props
	const headerWidth = 45
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
			<View
				style={{
					...styles.tableRow,
					backgroundColor: Colors.$backgroundPrimaryHeavy,
				}}
			>
				{/* Table first row */}
				<Text $textAccent style={{ width: `${headerWidth}%` }}>
					{new Date(schoolYear!.startDate).getFullYear()}/
					{new Date(schoolYear!.endDate).getFullYear()} Четверти
				</Text>

				{/* Table rows */}
				{totals.result[0].termTotals.map((_, i, a) => (
					<Text
						$textAccent
						style={{ width: termTotalWidth }}
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
						<SubjectName
							iconsSize={16}
							subjectId={total.subjectId}
							subjects={props.subjects.result!}
							style={{
								color: Colors.$textDefault,
							}}
						/>
					</View>

					{/* Table rows */}
					{total.termTotals.map((term, i) => (
						<Mark
							duty={false}
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
			<Text $textDisabled center margin-s1>
				{totals.updateDate}
			</Text>
		</ScrollView>
	)
}

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


