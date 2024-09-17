import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import Loading from '~components/Loading'
import Mark from '~components/Mark'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { Total } from '~services/net-school/entities'
import { SubjectPerformanceStores } from '~services/net-school/store'
import { Spacings } from '../../../utils/Spacings'
import { calculateMarks } from '../../../utils/calculateMarks'
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
	const assignments = SubjectPerformanceStores.use({
		studentId,
		subjectId: props.total.subjectId,
	})

	assignments.withParams({
		termId: props.selectedTerm.id,
	})

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
			assignments.result &&
			calculateMarks({
				totals: assignments.result,
				attendance: TermStore.attendance,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[assignments.result, TermStore.attendance],
	)

	if (assignments.fallback)
		return <View style={viewContainerStyle}>{assignments.fallback}</View>

	if (!marks)
		return (
			<View style={viewContainerStyle}>
				<Loading />
			</View>
		)

	const { totalsAndSheduledTotals, maxWeight, minWeight } = marks

	if (totalsAndSheduledTotals.length === 0) return

	return (
		<ScrollView
			horizontal
			style={viewStyle}
			contentContainerStyle={containerStyle}
			fadingEdgeLength={5}
		>
			{totalsAndSheduledTotals.map(e => (
				<Mark
					duty={e.duty ?? false}
					mark={e.result ?? 'Нет'}
					weight={e.weight}
					maxWeight={maxWeight}
					minWeight={minWeight}
					style={markStyle}
					key={e.assignmentId}
					onPress={props.openDetails}
				/>
			))}
		</ScrollView>
	)
})

const markStyle: StyleProp<ViewStyle> = {
	padding: Spacings.s1,
	paddingHorizontal: Spacings.s2 + 4,
	marginHorizontal: 2,
}
