import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import Loading from '~components/Loading'
import Mark from '~components/Mark'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { Total } from '~services/net-school/entities'
import { SubjectPerformanceStores } from '~services/net-school/store'
import { Spacings } from '../../../utils/Spacings'
import { calculateMarks, CalculateTotals } from '../../../utils/calculateMarks'
import { SubjectInfo, TermStore } from './state'

const containerStyle: StyleProp<ViewStyle> = {
	padding: Spacings.s1,
	alignItems: 'center',
}

export default observer(function SubjectMarksInline(
	props: Omit<SubjectInfo, 'attendance'> & {
		term: Total['termTotals'][number]
		openDetails: () => void
	},
) {
	const { studentId } = Settings

	let result:
		| { totals?: undefined; fallback: React.JSX.Element }
		| { totals: CalculateTotals; fallback?: undefined }
		| undefined

	// TODO Investigate why Homework store does not returns assignments with marks
	// const homework = HomeworkMarksStore.result
	// if (homework) {
	// 	const allAssignments = homework.filter(
	// 		e => e.subjectId === props.total.subjectId,
	// 	)
	// 	const results = allAssignments // allAssignments
	// 		.filter(e => typeof e.result === 'number')
	// 		.map(e => ({ date: e.dueDate, ...e }))

	// 	if (results.length) {
	// 		result = {
	// 			totals: {
	// 				results,
	// 				averageMark: props.term.avgMark ?? 0,
	// 				classmeetingsStats: { passed: results.length, scheduled: 0 },
	// 			},
	// 		}
	// 	}
	// }

	const assignments = SubjectPerformanceStores.use({
		studentId,
		subjectId: props.total.subjectId,
	})

	if (!result) {
		assignments.withParams({
			termId: props.selectedTerm.id,
		})

		if (assignments.result) {
			result = {
				totals: assignments.result,
			}
		} else {
			result = {
				fallback: assignments.fallback,
			}
		}
	}

	const backgroundColor = Theme.colors.elevation.level1
	const [viewStyle, viewContainerStyle] = useMemo(() => {
		const viewStyle: StyleProp<ViewStyle> = {
			flex: 1,
			backgroundColor,
		}

		return [viewStyle, [viewStyle, containerStyle]]
	}, [backgroundColor])

	const marks = useMemo(
		() =>
			result.totals &&
			calculateMarks({
				totals: result.totals,
				attendance: TermStore.attendance,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[result.totals, TermStore.attendance],
	)

	if (result.fallback)
		return <View style={viewContainerStyle}>{result.fallback}</View>

	if (!marks)
		return (
			<View style={viewContainerStyle}>
				<Loading />
			</View>
		)

	const { totalsAndSheduledTotals, maxWeight, minWeight } = marks

	if (totalsAndSheduledTotals.length === 0) return

	return (
		<>
			<ScrollView
				horizontal
				style={viewStyle}
				contentContainerStyle={containerStyle}
				fadingEdgeLength={5}
			>
				{totalsAndSheduledTotals.map((e, i) => (
					<Mark
						duty={e.duty ?? false}
						mark={e.result ?? null}
						weight={e.weight}
						maxWeight={maxWeight}
						minWeight={minWeight}
						style={markStyle}
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
				textStyle={{ fontSize: 18 }}
				subTextStyle={{ fontSize: 8 }}
				style={{ padding: Spacings.s2, alignSelf: 'center' }}
			/>
		</>
	)
})

const markStyle: StyleProp<ViewStyle> = {
	padding: Spacings.s1,
	paddingHorizontal: Spacings.s2 + 4,
	marginHorizontal: 2,
}
