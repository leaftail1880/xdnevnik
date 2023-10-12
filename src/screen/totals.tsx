import { ScrollView, Text, TextStyle, View } from 'react-native'
import { API } from '../NetSchool/api'
import { ACCENT_COLOR, INVISIBLE_COLOR, STYLES } from '../constants'
import { useAsync } from '../hooks/async'

export function TotalsScreen(props: { ctx: { studentId?: number } }) {
	const { studentId } = props.ctx
	const [education, FallbackEducation] = useAsync(
		() => API.education({ studentId: studentId! }),
		'данных об обучении',
		[API.changes, studentId]
	)

	// TODO Create option to schoose school year
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

	function getSubjectName(id: number) {
		return (
			(subjects && subjects.find(subject => id === subject.id)?.name) ??
			'Предмет404'
		)
	}

	function getAvgMark(mark: number): TextStyle {
		let color: string
		if (mark >= 4.6) {
			color = '#2a8700'
		} else if (mark >= 3.6) {
			color = '#ffe500'
		} else if (mark && mark <= 2.6) {
			color = '#ff1900'
		} else {
			color = INVISIBLE_COLOR
		}
		return { backgroundColor: color, color: STYLES.buttonText.color }
	}

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
								width: `${headerWidth}%`,
								...STYLES.tableCell,
							}}
						>
							<Text>{getSubjectName(total.subjectId)}</Text>
						</View>

						{/* Table rows */}
						{total.termTotals.map((term, i) => (
							<Text
								style={{
									...STYLES.tableCell,
									...getAvgMark(term.avgMark),
									width: termTotalWidth,
									textAlign: 'center',
								}}
								key={i.toString() + term.avgMark + term.term.name}
							>
								{term.avgMark}
							</Text>
						))}
					</View>
				))}
			</ScrollView>
		)
	)
}
