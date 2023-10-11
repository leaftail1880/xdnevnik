import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { STYLES } from '../constants'
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

	return (
		FallbackEducation ||
		FallbackSubjects ||
		FallbackTotals || (
			<ScrollView>
				{totals!.map((total, i) => (
					<View key={i + ''} style={STYLES.button}>
						<Text style={{ fontSize: 25, ...STYLES.buttonText }}>
							{subjects!.find(e => e.id === total.subjectId)?.name ??
								'Предмет404'}
						</Text>
						<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
							{total.termTotals.map((x, i) => (
								<View style={STYLES.invertedSchedule_item} key={i + ''}>
									<Text style={STYLES.invertedButtonText}>{x.avgMark}</Text>
								</View>
							))}
						</View>
						{total.yearTotals.map((e, i) => (
							<View key={i + ''}>
								<Text style={STYLES.buttonText}>{e.period.periodName}</Text>
								<Text style={{ fontWeight: 'bold', ...STYLES.buttonText }}>
									{e.mark}
								</Text>
							</View>
						))}
						{/* <Text style={{ fontWeight: 'bold', ...STYLES.buttonText }}>
							{LANG['avg_summative'] + i.summative_avg_value}
							</Text>
						<Text style={{ fontWeight: 'bold', ...STYLES.buttonText }}>
						{LANG['avg_formative'] + i.formative_avg_value}
						</Text>
						<Text style={{ fontWeight: 'bold', ...STYLES.buttonText }}>
						{LANG['avg_final'] + i.result_final_mark}
						</Text> */}

						{/* <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
							{i.summative_list.map(x => (
								<Button
								onPress={() => Alert.alert(x.lesson_thema, x.created_at)}
								style={STYLES.invertedSchedule_item}
								>
								<Text style={STYLES.invertedButtonText}>
								{(x.mark_criterion ?? 'F') + ' ' + x.mark_value}
								</Text>
								</Button>
								))}
							</View> */}
						{/* <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
							{total.yearTotals.map(x => (
								<View style={STYLES.invertedSchedule_item} key={x.mark}>
								<Text style={STYLES.invertedButtonText}>{x.mark}</Text>
								</View>
								))}
							</View> */}
					</View>
				))}
			</ScrollView>
		)
	)

	// return (
	// 	subjects &&
	// 	totals && (
	// 		<ScrollView
	// 			contentContainerStyle={{
	// 				justifyContent: 'center',
	// 				alignContent: 'center',
	// 				flex: 1,
	// 			}}
	// 		>
	// 			<View style={STYLES.table}>
	// 				{/* Table Head */}
	// 				<View style={STYLES.table_head}>
	// 					<View style={{ width: `${HeaderSize}%` }}>
	// 						<Text style={STYLES.table_head_captions}>
	// 							Четверти {/* TODO Add select for school year */}
	// 							{new Date(schoolYear.startDate).getFullYear()}/
	// 							{new Date(schoolYear.endDate).getFullYear()}
	// 						</Text>
	// 					</View>
	// 					{totals[0].termTotals.map((_, i, a) => (
	// 						<View
	// 							style={{ width: `${~~((100 - HeaderSize) / a.length)}%` }}
	// 							key={i.toString()}
	// 						>
	// 							<Text style={STYLES.table_head_captions}>
	// 								{i + 1}/{a.length}
	// 							</Text>
	// 						</View>
	// 					))}
	// 				</View>

	// 				{/* Table Body - Single Row */}
	// 				{totals.map(total => (
	// 					<View
	// 						style={STYLES.table_body_single_row}
	// 						key={Date.now().toString()}
	// 					>
	// 						<View style={{ width: HeaderSize }}>
	// 							<Text style={STYLES.table_data}>
	// 								{subjects.find(subject => total.subjectId === subject.id)
	// 									?.name ?? 'Предмет404'}
	// 							</Text>
	// 						</View>
	// 						{total.termTotals.map((term, i, a) => (
	// 							<View
	// 								style={{ width: `${~~((100 - HeaderSize) / a.length)}%` }}
	// 								key={i.toString()}
	// 							>
	// 								<Text style={STYLES.table_data}>{term.avgMark}</Text>
	// 							</View>
	// 						))}
	// 					</View>
	// 				))}
	// 			</View>
	// 		</ScrollView>
	// 	)
	// )
}
