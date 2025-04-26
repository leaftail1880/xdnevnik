import { RoundedSurface } from '@/components/RoundedSurface'
import UpdateDate from '@/components/UpdateDate'
import { LANG } from '@/constants'
import { AsyncState } from '@/models/async.store'
import { XSettings } from '@/models/settings'
import type {
	PartialAssignment,
	SubjectPerformance,
} from '@/services/net-school/entities'
import {
	MarkAssignmentsStore,
	SubjectPerformanceStores,
} from '@/services/net-school/store'
import { Spacings } from '@/utils/Spacings'
import { calculateMarks } from '@/utils/calculateMarks'
import { setInAction } from '@/utils/setInAction'
import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { FlatList, View } from 'react-native'
import { Text } from 'react-native-paper'
import type { S_SUBJECT_TOTALS, TermNavigationParamMap } from '../navigation'
import { AddMarkForm } from './AddMarkForm'
import { SubjectTotalsBottomChips, SubjectTotalsTopChips } from './Chips'
import { SubjectScreenHeader } from './Header'
import { SubjectTotalMarkRow } from './Marks'
import { SubjectTotalsStatistic } from './Stats'
import { SubjectTotalsState } from './state'

type ScreenProps = StackScreenProps<
	TermNavigationParamMap,
	typeof S_SUBJECT_TOTALS
>

export default observer(function SubjectTotals({
	route,
	navigation,
}: ScreenProps) {
	const { studentId } = XSettings
	const { subjectId, termId } = route.params
	const performance = SubjectPerformanceStores.use({
		studentId,
		subjectId,
	})
	performance.withParams({ termId })
	return (
		<SubjectTotalsImpl
			{...route.params}
			performance={performance}
			navigateToDiary={() => navigation.getParent()?.navigate(LANG.s_diary)}
		/>
	)
})

const renderItem: <T>(e: { item: T }) => T = e => e.item

const setCustomMarks = (p: PartialAssignment[]) =>
	setInAction(SubjectTotalsState, { customMarks: p })

export const SubjectTotalsImpl = observer(function SubjectTotalsImpl({
	performance,
	navigateToDiary,
	finalMark,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	flatList: FL = FlatList,
}: {
	performance: AsyncState<SubjectPerformance>
	navigateToDiary: () => void
	finalMark: string | number | null
	flatList?: typeof FlatList
}) {
	const { studentId } = XSettings
	const studentSettings = XSettings.forStudentOrThrow()

	if (performance.fallback) return performance.fallback

	const marks = calculateMarks({
		totals: performance.result,
		lessonsWithoutMark: SubjectTotalsState.lessonsWithoutMark,
		customMarks: SubjectTotalsState.customMarks,
		attendance: SubjectTotalsState.attendance,
		targetMark: studentSettings.targetMark,
		defaultMark: studentSettings.defaultMark,
		defaultMarkWeight: studentSettings.defaultMarkWeight,
		markRoundAdd: XSettings.markRoundAdd,
	})

	if (!marks) return <Text>Ошибка при подсчете оценок</Text>
	const { avgMark, totalsAndSheduledTotals, maxWeight, minWeight, toGetMarks } =
		marks

	MarkAssignmentsStore.withParams({
		classmeetingsIds: totalsAndSheduledTotals
			.map(e => e.classMeetingId)
			.filter(e => typeof e === 'number'),
		studentId,
	})

	const totalsTypes = new Set<string>()
	for (const t of totalsAndSheduledTotals)
		if (t.assignmentTypeName) totalsTypes.add(t.assignmentTypeName)

	return (
		<View style={{ flex: 1 }}>
			<SubjectScreenHeader
				avgMark={avgMark}
				performance={performance.result}
				finalMark={finalMark}
			></SubjectScreenHeader>
			<FL
				refreshControl={performance.refreshControl}
				contentContainerStyle={{
					gap: Spacings.s2,
					paddingTop: Spacings.s2,
				}}
				renderItem={renderItem}
				data={[
					// eslint-disable-next-line react/jsx-key
					<SubjectTotalsTopChips
						toGetMarks={toGetMarks}
						performance={performance.result}
					></SubjectTotalsTopChips>,
					...totalsAndSheduledTotals
						.slice(
							SubjectTotalsState.collapsed && totalsAndSheduledTotals.length > 7
								? totalsAndSheduledTotals.length - 7
								: 0,
						)
						.reverse()
						.filter(
							e =>
								!SubjectTotalsState.disabledTotalTypes.has(
									e.assignmentTypeName,
								),
						)
						.map((e, i) => (
							<SubjectTotalMarkRow
								mark={e}
								maxWeight={maxWeight}
								minWeight={minWeight}
								navigateToDiary={navigateToDiary}
								onDelete={() =>
									setInAction(SubjectTotalsState, {
										customMarks: SubjectTotalsState.customMarks.filter(
											ee => ee !== e,
										),
									})
								}
								key={
									e.assignmentId ??
									(totalsAndSheduledTotals.length + 5 + i).toString()
								}
							/>
						)),
					// eslint-disable-next-line react/jsx-key
					<SubjectTotalsBottomChips
						length={totalsAndSheduledTotals.length}
						totalsTypes={totalsTypes}
					></SubjectTotalsBottomChips>,
					<RoundedSurface elevation={1} key="abc">
						<AddMarkForm
							setCustomMarks={setCustomMarks}
							customMarks={SubjectTotalsState.customMarks}
							key="addmarkform"
						/>
					</RoundedSurface>,
					// eslint-disable-next-line react/jsx-key
					<SubjectTotalsStatistic performance={performance.result} />,
					!!performance.updateDate && <UpdateDate store={performance} />,
				].filter(e => !!e)}
			/>
		</View>
	)
})
