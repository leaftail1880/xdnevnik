import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import React, { memo, useCallback } from 'react'
import { FlatList, FlatListProps, ListRenderItem } from 'react-native'
import { TotalsScreenParams } from '../navigation'

import Loading from '@/components/Loading'
import SelectModal from '@/components/SelectModal'
import UpdateDate from '@/components/UpdateDate'

import { Chips } from '@/components/Chips'
import { XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { NSEntity, Subject, Total } from '@/services/net-school/entities'
import {
	EducationStore,
	HomeworkMarksStore,
	SubjectsStore,
	TotalsStore,
} from '@/services/net-school/store'
import { Spacings } from '@/utils/Spacings'
import { ToggleChip } from '@/components/ToggleChip'
import SubjectPerformanceInline from './Subject'
import { TermStore, TermStoreSortModes } from './state'

// eslint-disable-next-line mobx/missing-observer
export default memo(function TermTotalsScreen(props: TotalsScreenParams) {
	const renderSubject = useCallback<RenderSubject>(
		totalProps => (
			<SubjectPerformanceInline
				attendance
				{...totalProps}
				navigation={props.navigation}
			/>
		),
		[props.navigation],
	)

	return (
		<TermTotalsList
			renderSubject={renderSubject}
			ListHeaderComponent={ChipsRow}
			ListFooterComponent={<UpdateDate store={TotalsStore} />}
		/>
	)
})

const ChipsRow = observer(function Header() {
	if (!XSettings.studentId) return

	const terms = TermStore.terms
	const studentSettings = XSettings.forStudent(XSettings.studentId)
	return (
		<Chips style={{ paddingBottom: Spacings.s1 }}>
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
						runInAction(() => (studentSettings.currentTermv2 = v.term))
					}
				/>
			)}

			<ToggleChip store={TermStore} storeKey="attendance" label="Пропуски" />
			<ToggleChip
				store={TermStore}
				storeKey="toGetMark"
				label="Целевая оценка"
			/>
			<ToggleChip
				store={TermStore}
				storeKey="shortStats"
				label="Краткая статистика"
			/>
			<ToggleChip
				store={TermStore}
				storeKey="attendanceStats"
				label="Посещаемость"
			/>
			<ToggleChip
				store={TermStore}
				storeKey="attestationStats"
				label="Аттестация"
			/>
		</Chips>
	)
})

export type RenderSubject = (props: {
	total: Total
	subjects: Subject[]
	selectedTerm: NSEntity
	term: Total['termTotals'][number] | undefined
}) => React.ReactElement

export const TermTotalsList = observer(function TermTotalsList(
	props: Omit<
		FlatListProps<Total>,
		'keyExtractor' | 'refreshControl' | 'data' | 'renderItem'
	> & {
		renderSubject: RenderSubject
		ft?: typeof import('react-native').FlatList
	},
) {
	const renderSubject = props.renderSubject
	const renderItem = useCallback<ListRenderItem<Total>>(
		total =>
			TermStore?.currentTerm
				? renderSubject({
						total: total.item,
						selectedTerm: TermStore.currentTerm,
						subjects: SubjectsStore.result!,
						term: total.item.termTotals.find(
							e => e.term.id === TermStore.currentTerm!.id,
						),
					})
				: null,
		[renderSubject],
	)

	Theme.key

	HomeworkMarksStore.withParams({
		studentId: XSettings.studentId,
		withoutMarks: false,
		withExpiredClassAssign: true,
	})

	const F = props.ft ?? FlatList

	return (
		EducationStore.fallback ||
		SubjectsStore.fallback ||
		TotalsStore.fallback ||
		(TotalsStore.result === null || TotalsStore.result.length < 1 ? (
			<Loading text="Загрузка из кэша..." />
		) : (
			<F<Total>
				initialNumToRender={5}
				maxToRenderPerBatch={1}
				scrollEventThrottle={2000}
				{...props}
				renderItem={renderItem}
				refreshControl={TotalsStore.refreshControl}
				keyExtractor={keyExtractor}
				data={TermStore.totalsResult}
			/>
		))
	)
})

const keyExtractor = (total: Total): string => total.subjectId.toString()
