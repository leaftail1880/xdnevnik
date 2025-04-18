import { Chips } from '@/components/Chips'
import Loading from '@/components/Loading'
import Mark, { MarkColorsBG, MarkColorsText } from '@/components/Mark'
import NumberInputSetting from '@/components/NumberInput'
import { changeSettings, Settings, StudentSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import {
	ClassMeetingStats,
	SubjectPerformance,
	Total,
} from '@/services/net-school/entities'
import { SubjectPerformanceStores } from '@/services/net-school/store'
import { calculateMarks } from '@/utils/calculateMarks'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import {
	ScrollView,
	StyleProp,
	StyleSheet,
	View,
	ViewStyle,
} from 'react-native'
import { Chip, Text } from 'react-native-paper'
import { SubjectInfo, TermStore } from './state'
import { ToGetMarkChips } from './ToGetMarkChip'
import { AttestationStatsChip } from './AttestationStatsChip'
import { AttendanceStatsChip } from './AttendanceStatsChip'

const styles = StyleSheet.create({
	container: {
		padding: Spacings.s1,
		alignItems: 'center',
		transform: [],
	},
	mark: {
		padding: Spacings.s1,
		paddingHorizontal: Spacings.s2,
		marginHorizontal: 2,
		transform: [{ scaleX: -1 }],
		height: 40,
	},
	marks: {
		flexDirection: 'row',
	},
	totalMark: { padding: Spacings.s2, alignSelf: 'center' },
	totalMarkText: { fontSize: 18 },
	totalMarkSubStyle: { fontSize: 8 },
	chips: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: Spacings.s2,
	},
	marksAndChipsContainer: {
		gap: Spacings.s1,
		padding: Spacings.s1,
	},
})

export default observer(function SubjectMarks(
	props: Omit<SubjectInfo, 'attendance'> & {
		term: Total['termTotals'][number]
		openDetails: () => void
	},
) {
	const { studentId } = Settings

	const performance = SubjectPerformanceStores.use({
		studentId,
		subjectId: props.total.subjectId,
	})
	performance.withParams({ termId: props.selectedTerm.id })

	const student = studentId ? Settings.forStudent(studentId) : undefined
	const backgroundColor = Theme.colors.elevation.level1
	const [viewStyle, viewContainerStyle] = useMemo(() => {
		const viewStyle: StyleProp<ViewStyle> = {
			backgroundColor,
			flex: 1,
			flexGrow: 1,
			transform: [{ scaleX: -1 }],
		}

		return [viewStyle, [viewStyle, styles.container]]
	}, [backgroundColor])

	const attendance = TermStore.attendance
	const marks = useMemo(
		() =>
			performance?.result &&
			calculateMarks({
				attendance,
				totals: performance.result,
				defaultMark: student?.defaultMark,
				defaultMarkWeight: student?.defaultMarkWeight,
				targetMark: student?.targetMark,
				markRoundAdd: Settings.markRoundAdd,
			}),
		[
			performance.result,
			attendance,
			student?.defaultMark,
			student?.defaultMarkWeight,
			student?.targetMark,
		],
	)

	useEffect(() => {
		if (marks)
			runInAction(
				() =>
					(TermStore.subjectGetMarks[props.total.subjectId] = marks.toGetMarks),
			)
	}, [marks, marks?.toGetMarks, props.total.subjectId])

	if (!student || !studentId) return

	if (performance.fallback)
		return <View style={viewContainerStyle}>{performance.fallback}</View>

	if (!marks)
		return (
			<View style={viewContainerStyle}>
				<Loading />
			</View>
		)

	const { totalsAndSheduledTotals, maxWeight, minWeight, toGetMarks } = marks

	if (totalsAndSheduledTotals.length === 0) return
	const perf = performance.result
	const meetings = perf.classmeetingsStats
	return (
		<View style={styles.marksAndChipsContainer}>
			<View style={styles.marks}>
				<ScrollView
					horizontal
					style={viewStyle}
					contentContainerStyle={styles.container}
					fadingEdgeLength={100}
					showsHorizontalScrollIndicator={false}
				>
					{totalsAndSheduledTotals
						.slice()
						.reverse()
						.map((e, i) => (
							<Mark
								duty={e.duty ?? false}
								mark={e.result ?? null}
								weight={e.weight}
								maxWeight={maxWeight}
								minWeight={minWeight}
								style={styles.mark}
								key={i.toString()}
								onPress={props.openDetails}
							/>
						))}
				</ScrollView>
				<Mark
					duty={false}
					finalMark={props.term?.mark}
					mark={props.term.avgMark}
					onPress={props.openDetails}
					textStyle={styles.totalMarkText}
					subTextStyle={styles.totalMarkSubStyle}
					style={styles.totalMark}
				/>
			</View>
			<Chips style={{ padding: 0 }}>
				{TermStore.toGetMark && <ToGetMarkChips toGetMarks={toGetMarks} />}
				{TermStore.shortStats && (
					<Chip
						compact
						onPress={() => {
							ModalAlert.show(
								'Краткая статистика',
								<View>
									<Text>О - Оценки</Text>
									<Text>У - Прошедшие уроки/Запланированные уроки</Text>
									<Text>В - Суммарный вес всех оценок</Text>
								</View>,
							)
						}}
					>
						О {perf.results.length}, У {meetings.passed}/{meetings.scheduled}, В{' '}
						{perf.results.reduce((p, c) => p + c.weight, 0)}
					</Chip>
				)}
				{TermStore.attendanceStats && (
					<AttendanceStatsChip perf={perf} meetings={meetings} />
				)}
				{TermStore.attestationStats && <AttestationStatsChip perf={perf} />}
			</Chips>
		</View>
	)
})
