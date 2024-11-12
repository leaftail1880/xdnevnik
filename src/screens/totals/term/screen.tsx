import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { memo, useCallback } from 'react'
import { FlatList, ListRenderItem, View } from 'react-native'
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
import SubjectPerformanceInline from './PeformanceInline'
import { TermStore } from './state'

// eslint-disable-next-line mobx/missing-observer
export default memo(function TermTotalsScreen(props: TotalsScreenParams) {
	return (
		<>
			<StickyHeader />
			<TermTotalsList {...props} />
		</>
	)
})

const StickyHeader = observer(function StickyHeader() {
	if (!Settings.studentId) return

	const terms = TermStore.terms
	const studentSettings = Settings.forStudent(Settings.studentId)
	return (
		terms && (
			<SelectModal
				data={terms}
				mode="button"
				value={String(TermStore.currentTerm?.id)}
				label={''}
				onSelect={v =>
					runInAction(() => (studentSettings.currentTerm = v.term))
				}
			/>
		)
	)
})

const Header = observer(function Header() {
	return (
		<View
			style={{
				flex: 1,
				flexDirection: 'row',
				gap: Spacings.s2,
				padding: Spacings.s2,
			}}
		>
			<Chip
				mode="flat"
				selected={TermStore.sort}
				onPress={() => {
					runInAction(() => (TermStore.sort = !TermStore.sort))
				}}
			>
				Плохие оценки вверху
			</Chip>
			<Chip
				mode="flat"
				selected={TermStore.attendance}
				onPress={() => {
					runInAction(() => (TermStore.attendance = !TermStore.attendance))
				}}
			>
				Пропуски
			</Chip>
		</View>
	)
})

const TermTotalsList = observer(function TermTotalsList({
	navigation,
}: TotalsScreenParams) {
	Theme.key

	HomeworkMarksStore.withParams({
		studentId: Settings.studentId,
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
			<Loading text="Загрузка из кэша{dots}" />
		) : (
			<FlatList
				ListHeaderComponent={Header}
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
