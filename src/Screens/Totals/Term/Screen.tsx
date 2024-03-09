import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { memo, useCallback } from 'react'
import { FlatList, ListRenderItem, View } from 'react-native'
import { Chip } from 'react-native-paper'
import { TotalsScreenParams } from '..'

import Loading from '../../../Components/Loading'
import SelectModal from '../../../Components/SelectModal'
import UpdateDate from '../../../Components/UpdateDate'

import { Total } from '../../../NetSchool/classes'
import {
	EducationStore,
	SubjectsStore,
	TotalsStore,
} from '../../../Stores/NetSchool'
import { Settings } from '../../../Stores/Settings'
import { Theme } from '../../../Stores/Theme'
import { Spacings } from '../../../utils/Spacings'
import SubjectPerformanceInline from './PeformanceInline'
import { TermStore } from './TermStore'

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
	const terms = TermStore.terms
	return (
		<View>
			{terms && (
				<SelectModal
					data={terms}
					value={Settings.currentTerm?.id + ''}
					onSelect={v => Settings.save({ currentTerm: v.term })}
					label={Settings.currentTerm ? '' : 'Четверть'}
					mode="button"
				/>
			)}
		</View>
	)
})

const Header = observer(function Header() {
	return (
		<View
			style={{
				flex: 1,
				flexDirection: 'row',
				paddingVertical: Spacings.s2,
			}}
		>
			<Chip
				mode="outlined"
				selected={TermStore.sort}
				onPress={() => {
					runInAction(() => (TermStore.sort = !TermStore.sort))
				}}
				style={{ marginHorizontal: Spacings.s2 }}
			>
				Плохие оценки вверху
			</Chip>
			<Chip
				mode="outlined"
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
	const renderItem = useCallback<ListRenderItem<Total>>(
		total => (
			<SubjectPerformanceInline
				attendance
				navigation={navigation}
				total={total.item}
				selectedTerm={Settings.currentTerm!}
				subjects={SubjectsStore.result!}
			/>
		),
		[navigation]
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
				maxToRenderPerBatch={3}
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



