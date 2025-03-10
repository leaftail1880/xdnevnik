import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { memo, useCallback } from 'react'
import { FlatList, ListRenderItem, ScrollView } from 'react-native'
import { Chip } from 'react-native-paper'
import { TotalsScreenParams } from '../navigation'

import Loading from '~components/Loading'
import SelectModal from '~components/SelectModal'
import UpdateDate from '~components/UpdateDate'

import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { Total } from '~services/net-school/entities'
import {
	EducationStore,
	HomeworkMarksStore,
	SubjectsStore,
	TotalsStore,
} from '~services/net-school/store'
import { Spacings } from '../../../utils/Spacings'
import SubjectPerformanceInline from './Subject'
import { TermStore, TermStoreSortModes } from './state'

// eslint-disable-next-line mobx/missing-observer
export default memo(function TermTotalsScreen(props: TotalsScreenParams) {
	return (
		<>
			<TermTotalsList {...props} />
		</>
	)
})

const ChipsRow = observer(function Header() {
	if (!Settings.studentId) return

	const terms = TermStore.terms
	const studentSettings = Settings.forStudent(Settings.studentId)
	return (
		<ScrollView
			style={{ padding: Spacings.s2 }}
			contentContainerStyle={{ gap: Spacings.s2 }}
			showsHorizontalScrollIndicator={false}
			horizontal
		>
			<SelectModal
				mode="chip"
				label="Режим сортировки"
				value={TermStore.sortMode}
				inlineChip
				data={TermStoreSortModes}
				onSelect={v => runInAction(() => (TermStore.sortMode = v.value))}
			/>
			{terms && (
				<SelectModal
					data={terms}
					mode="chip"
					value={String(TermStore.currentTerm?.id)}
					inlineChip
					label={'Четверть/полугодие'}
					onSelect={v =>
						runInAction(() => (studentSettings.currentTerm = v.term))
					}
				/>
			)}
			<Chip
				mode="flat"
				selected={TermStore.attendance}
				compact
				onPress={() => {
					runInAction(() => (TermStore.attendance = !TermStore.attendance))
				}}
			>
				Пропуски
			</Chip>
		</ScrollView>
	)
})

const TermTotalsList = observer(function TermTotalsList({
	navigation,
}: TotalsScreenParams) {
	Theme.key

	HomeworkMarksStore.withParams({
		studentId: Settings.studentId,
		withoutMarks: false,
		withExpiredClassAssign: true,
	})

	const renderItem = useCallback<ListRenderItem<Total>>(
		total =>
			TermStore?.currentTerm ? (
				<SubjectPerformanceInline
					attendance
					navigation={navigation}
					total={total.item}
					selectedTerm={TermStore.currentTerm}
					subjects={SubjectsStore.result!}
				/>
			) : null,
		[navigation],
	)

	return (
		EducationStore.fallback ||
		SubjectsStore.fallback ||
		TotalsStore.fallback ||
		(TotalsStore.result === null || TotalsStore.result.length < 1 ? (
			<Loading text="Загрузка из кэша..." />
		) : (
			<FlatList
				ListHeaderComponent={ChipsRow}
				initialNumToRender={5}
				maxToRenderPerBatch={1}
				scrollEventThrottle={2000}
				data={TermStore.totalsResult}
				refreshControl={TotalsStore.refreshControl}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ListFooterComponent={<UpdateDate store={TotalsStore} />}
			/>
		))
	)
})

const keyExtractor = (total: Total): string => total.subjectId.toString()
