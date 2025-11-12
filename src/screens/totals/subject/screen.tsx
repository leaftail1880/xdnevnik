import { RoundedSurface } from '@/components/RoundedSurface'
import UpdateDate from '@/components/UpdateDate'
import { Screens } from '@/constants'
import { XSettings } from '@/models/settings'
import type {
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
import { SubjectTotalsStates, SubjectTotalsStore } from './state'
import { AsyncState } from '@/models/async.store'

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
  if (performance.fallback) return performance.fallback
  return (
    <SubjectTotalsImpl
      {...route.params}
      performance={performance.result}
      performanceStore={performance}
      navigateToDiary={() => navigation.getParent()?.navigate(Screens.Diary)}
    />
  )
})

const renderItem: <T>(e: { item: T }) => T = e => e.item

export const SubjectTotalsImpl = observer(function SubjectTotalsImpl({
  performance,
  navigateToDiary,
  finalMark, performanceStore,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  flatList: FL = FlatList,
}: {
  performance: SubjectPerformance,
  performanceStore?: AsyncState<SubjectPerformance>,
  navigateToDiary: () => void
  finalMark: string | number | null
  flatList?: typeof FlatList
}) {
  const { studentId } = XSettings
  const studentSettings = XSettings.forStudentOrThrow()
  const SubjectTotalsState = SubjectTotalsStates.use(performance.subject.id)

  const marks = calculateMarks({
    totals: performance,
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
        performance={performance}
        finalMark={finalMark}
      ></SubjectScreenHeader>
      <FL
        refreshControl={performanceStore?.refreshControl}
        contentContainerStyle={{
          gap: Spacings.s2,
          paddingTop: Spacings.s2,
        }}
        renderItem={renderItem}
        data={[
          <SubjectTotalsTopChips
            toGetMarks={toGetMarks}
            performance={performance}
            store={SubjectTotalsState}
            key="topChips"
          />,
          ...totalsAndSheduledTotals
            // .slice(
            // 	SubjectTotalsState.collapsed && totalsAndSheduledTotals.length > 7
            // 		? totalsAndSheduledTotals.length - 7
            // 		: 0,
            // )
            // .reverse()
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
            store={SubjectTotalsState}
            key="bottomChips"
          />,
          <RoundedSurface elevation={1} key="addmarkformSurface">
            <AddMarkForm
              setCustomMarks={(p) =>
                setInAction(SubjectTotalsState, { customMarks: p })}
              customMarks={SubjectTotalsState.customMarks}
              key="addmarkform"
            />
          </RoundedSurface>,
          <SubjectTotalsStatistic performance={performance} key="stats"

            store={SubjectTotalsState}
          />,
          !!performanceStore?.updateDate && <UpdateDate store={performanceStore} />,
        ].filter(e => !!e)}
      />
    </View>
  )
})
