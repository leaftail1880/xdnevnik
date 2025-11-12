import Mark from '@/components/Mark'
import { RoundedSurface } from '@/components/RoundedSurface'
import { XSettings } from '@/models/settings'
import { SubjectPerformance } from '@/services/net-school/entities'
import { Spacings } from '@/utils/Spacings'
import { observer } from 'mobx-react-lite'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { SubjectTotalsStore } from './state'

export const SubjectTotalsStatistic = observer(function SubjectTotalsStatistic({
  performance,
  store
}: {
  performance: SubjectPerformance,
  store: SubjectTotalsStore
}) {
  return (
    <RoundedSurface elevation={1}>
      {!!store.customMarks.length && (
        <Text>
          Возможных оценок:{' '}
          <Text variant="labelLarge">
            {store.customMarks.length}
          </Text>
        </Text>
      )}
      {!!performance.teachers.length && (
        <Text>
          Учитель:{' '}
          <Text variant="labelLarge">
            {performance.teachers
              .map(e => XSettings.fullname(e.name))
              .join(', ')}
          </Text>
        </Text>
      )}
      {performance.classmeetingsStats.passed !== 0 && (
        <Text>
          Прошло уроков:{' '}
          <Text variant="labelLarge">
            {performance.classmeetingsStats.passed}/
            {performance.classmeetingsStats.scheduled}
          </Text>
          , осталось:{' '}
          <Text variant="labelLarge">
            {performance.classmeetingsStats.scheduled -
              performance.classmeetingsStats.passed}
          </Text>
        </Text>
      )}

      <Text>
        Всего оценок:{' '}
        <Text variant="labelLarge">{performance.results.length}</Text>
      </Text>

      <Text>
        Суммарный вес всех оценок:{' '}
        <Text variant="labelLarge">
          {performance.results.reduce((p, c) => p + c.weight, 0)}
        </Text>
      </Text>
      {performance.classmeetingsStats.passed !== 0 && (
        <View style={styles.view}>
          <Text>Средний балл класса: </Text>
          <Mark
            mark={performance.classAverageMark}
            duty={false}
            style={styles.pad}
          />
        </View>
      )}
    </RoundedSurface>
  )
})

const styles = StyleSheet.create({
  pad: { padding: Spacings.s1 },
  view: {
    flexDirection: 'row',
    marginVertical: Spacings.s1,
    flex: 1,
    alignItems: 'center',
  },
})
