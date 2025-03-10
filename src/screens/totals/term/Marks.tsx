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
import Loading from '~components/Loading'
import Mark from '~components/Mark'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { Total } from '~services/net-school/entities'
import { SubjectPerformanceStores } from '~services/net-school/store'
import { calculateMarks } from '~utils/calculateMarks'
import { Spacings } from '~utils/Spacings'
import { SubjectInfo, TermStore } from './state'
import { ToGetMarkChip } from './ToGetMarkChip'

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
	},
	marks: {
		flexDirection: 'row',
		paddingHorizontal: Spacings.s1,
		paddingBottom: Spacings.s1,
	},
	totalMark: { padding: Spacings.s2, alignSelf: 'center' },
	totalMarkText: { fontSize: 18 },
	totalMarkSubStyle: { fontSize: 8 },
	chips: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		padding: Spacings.s1,
		gap: Spacings.s2,
	},
})

export default observer(function SubjectMarks(
	props: Omit<SubjectInfo, 'attendance'> & {
		term: Total['termTotals'][number]
		openDetails: () => void
	},
) {
	const { studentId } = Settings

	const assignments = SubjectPerformanceStores.use({
		studentId,
		subjectId: props.total.subjectId,
	})

	assignments.withParams({ termId: props.selectedTerm.id })

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

	const marks = useMemo(
		() =>
			assignments?.result &&
			calculateMarks({
				totals: assignments.result,
				attendance: TermStore.attendance,
				defaultMark: student?.defaultMark,
				defaultMarkWeight: student?.defaultMarkWeight,
				targetMark: student?.targetMark,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			assignments.result,
			TermStore.attendance,
			student?.defaultMark,
			student?.defaultMarkWeight,
			student?.targetMark,
		],
	)

	useEffect(() => {
		if (marks)
			runInAction(
				() =>
					(TermStore.subjectGetMarks[props.total.subjectId] =
						marks.toGetTarget),
			)
	}, [marks, marks?.toGetTarget, props.total.subjectId])

	if (!student || !studentId) return

	if (assignments.fallback)
		return <View style={viewContainerStyle}>{assignments.fallback}</View>

	if (!marks)
		return (
			<View style={viewContainerStyle}>
				<Loading />
			</View>
		)

	const { totalsAndSheduledTotals, maxWeight, minWeight, toGetTarget } = marks

	if (totalsAndSheduledTotals.length === 0) return
	return (
		<>
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
			{typeof toGetTarget !== 'undefined' && (
				<View style={styles.chips}>
					<ToGetMarkChip toGetTarget={toGetTarget} />
				</View>
			)}
		</>
	)
})
