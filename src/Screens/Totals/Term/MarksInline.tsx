import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import { Text } from 'react-native-paper'
import Loading from '../../../Components/Loading'
import Mark from '../../../Components/Mark'
import { Total } from '../../../NetSchool/classes'
import { SubjectPerformanceStores } from '../../../Stores/NetSchool'
import { Settings } from '../../../Stores/Settings'
import { Theme } from '../../../Stores/Theme'
import { Spacings } from '../../../utils/Spacings'
import { calculateMarks } from '../../SubjectTotals/calculateMarks'
import { SubjectInfo, TermStore } from './TermStore'

export default observer(function SubjectMarksInline(
	props: Omit<SubjectInfo, 'attendance'> & {
		term: Total['termTotals'][number]
		openDetails: () => void
	}
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
		[assignments.result, TermStore.attendance]
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
					style={{ height: 45, width: 45, marginHorizontal: 2 }}
					key={e.assignmentId}
					onPress={props.openDetails}
				/>
			))}
		</ScrollView>
	)
})
