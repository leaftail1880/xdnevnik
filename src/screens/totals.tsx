import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { STYLES } from '../constants'
import { useAsync } from '../hooks/async'
Text

export const TotalsScreen = ({ studentId }: { studentId: number }) => {
	const education = useAsync(
		() => API.education({ studentId }),
		[API.changes, studentId]
	)

	// TODO Create option to schoose school year
	const schoolYear = education && education[0].schoolyear
	const schoolYearId = schoolYear && schoolYear.id

	const subjects = useAsync(
		() => API.subjects({ studentId, schoolYearId }),
		[API.changes, studentId, schoolYearId]
	)

	const totals = useAsync(
		() => API.totals({ studentId, schoolYearId }),
		[API.changes, studentId, schoolYearId]
	)

	const HeaderSize = 45

	return (
		subjects &&
		totals && (
			<ScrollView
				contentContainerStyle={{
					justifyContent: 'center',
					alignContent: 'center',
					flex: 1,
				}}
			>
				<View style={STYLES.table}>
					{/* Table Head */}
					<View style={STYLES.table_head}>
						<View style={{ width: `${HeaderSize}%` }}>
							<Text style={STYLES.table_head_captions}>
								Четверти {/* TODO Add select for school year */}
								{new Date(schoolYear.startDate).getFullYear()}/
								{new Date(schoolYear.endDate).getFullYear()}
							</Text>
						</View>
						{totals[0].termTotals.map((_, i, a) => (
							<View
								style={{ width: `${~~((100 - HeaderSize) / a.length)}%` }}
								key={i.toString()}
							>
								<Text style={STYLES.table_head_captions}>
									{i + 1}/{a.length}
								</Text>
							</View>
						))}
					</View>

					{/* Table Body - Single Row */}
					{totals.map(total => (
						<View
							style={STYLES.table_body_single_row}
							key={Date.now().toString()}
						>
							<View style={{ width: HeaderSize }}>
								<Text style={STYLES.table_data}>
									{subjects.find(subject => total.subjectId === subject.id)
										?.name ?? 'Предмет404'}
								</Text>
							</View>
							{total.termTotals.map((term, i, a) => (
								<View
									style={{ width: `${~~((100 - HeaderSize) / a.length)}%` }}
									key={i.toString()}
								>
									<Text style={STYLES.table_data}>{term.avgMark}</Text>
								</View>
							))}
						</View>
					))}
				</View>
			</ScrollView>
		)
	)
}
