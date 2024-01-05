import { observer } from 'mobx-react-lite'
import { ScrollView, StyleProp, ViewStyle } from 'react-native'
import { Colors, Spacings, Text, View } from 'react-native-ui-lib'
import { Loading } from '../../Components/Loading'
import { Mark } from '../../Components/Mark'
import { Total } from '../../NetSchool/classes'
import { createApiMethodStore } from '../../Stores/API.store'
import { KeyStore } from '../../Stores/KeyStore'
import { XDnevnik } from '../../Stores/Xdnevnik.store'
import { calculateMarks } from '../SubjectTotals/calculateMarks'
import { SubjectInfo } from './TotalsScreenTerm'

interface StoreID {
	studentId?: number
	subjectId: number
}

export const SubjectPerformanceStores = new KeyStore(
	(id: StoreID) => id.studentId + '|' + id.subjectId,
	(id: StoreID) =>
		createApiMethodStore('subjectPerformance', 'итогов по предмету', id)
)

export const SubjectMarksInline = observer(function SubjectMarksInline(
	props: SubjectInfo & {
		term: Total['termTotals'][number]
		openDetails: () => void
	}
) {
	const { studentId } = XDnevnik
	const assignments = SubjectPerformanceStores.use({
		studentId,
		subjectId: props.total.subjectId,
	})

	assignments.withParams({
		termId: props.selectedTerm.id,
	})

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
})
