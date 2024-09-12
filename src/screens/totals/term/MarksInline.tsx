import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import { Text } from 'react-native-paper'
import Loading from '~components/Loading'
import Mark from '~components/Mark'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { Total } from '~services/net-school/entities'
import { SubjectPerformanceStores } from '~services/net-school/store'
import { Spacings } from '../../../utils/Spacings'
import { calculateMarks } from '../../../utils/calculateMarks'
import { SubjectInfo, TermStore } from './state'

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

	const viewStyle: StyleProp<ViewStyle> = {
		margin: 0,
		flex: 1,
		alignSelf: 'center',
		backgroundColor: Theme.colors.elevation.level1,
	}

	const containerStyle: StyleProp<ViewStyle> = {
		padding: Spacings.s1,
		alignItems: 'center',
	}

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
		return (
			<View style={[viewStyle, containerStyle]}>{assignments.fallback}</View>
		)

	if (!marks)
		return (
			<View style={[viewStyle, containerStyle]}>
				<Loading />
			</View>
		)

	const { totalsAndSheduledTotals, maxWeight, minWeight } = marks

	if (totalsAndSheduledTotals.length === 0)
		return (
			<View style={[viewStyle, containerStyle, { alignContent: 'center' }]}>
				<Text>Оценок нет</Text>
			</View>
		)

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
					markWeight={
						e.weight
							? {
									max: maxWeight,
									min: minWeight,
									current: e.weight,
								}
							: void 0
					}
					style={{
						padding: Spacings.s1,
						paddingHorizontal: Spacings.s2 + 4,
						marginHorizontal: 2,
					}}
					key={e.assignmentId}
					onPress={props.openDetails}
				/>
			))}
		</ScrollView>
	)
})
