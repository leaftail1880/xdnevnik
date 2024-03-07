import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { FlatList, ListRenderItem, View } from 'react-native'
import { Chip, Text } from 'react-native-paper'
import SelectDropdown from 'react-native-select-dropdown'
import { TotalsContext } from '.'
import { dropdown, dropdownStyle } from '../../Components/Dropdown'
import { Loading } from '../../Components/Loading'
import { Spacings } from '../../Components/Spacings'
import { NSEntity, Subject, Total } from '../../NetSchool/classes'
import {
	EducationStore,
	SubjectPerformanceStores,
	SubjectsStore,
	TotalsStore,
} from '../../Stores/API'
import { Settings } from '../../Stores/Settings'
import { Theme } from '../../Stores/Theme'
import { SubjectPerformanceInline } from './SubjectPerformanceInline'

export const TermStore = new (class {
	sort = true
	attendance = false

	getTerms(totals = TotalsStore) {
		return totals.result?.[0]?.termTotals.map(e => e.term)
	}
	get totalsResult() {
		const selectedTerm = Settings.currentTerm
		if (!TotalsStore.result || !selectedTerm) return []

		if (this.sort)
			return TotalsStore.result
				.slice()
				.sort((a, b) => getTermSortValue(a) - getTermSortValue(b))
		return TotalsStore.result

		function getTermSortValue(
			total: Total,
			term = total.termTotals.find(e => e.term.id === selectedTerm!.id)
		) {
			if (!term) return 0

			let avg = term.avgMark ?? 0
			if (term.mark && !isNaN(Number(term.mark))) {
				avg = Number(term.mark)
			}

			const { store } = SubjectPerformanceStores.get(
				{
					studentId: Settings.studentId,
					subjectId: total.subjectId,
				},
				false
			)
			if (store.result?.results) avg += store.result?.results.length / 10000
			return avg
		}
	}
	constructor() {
		makeAutoObservable(this, { getTerms: false })
	}
})()

autorun(function loadSelectedTerm() {
	if (!TotalsStore.result) return

	const terms = TermStore.getTerms()
	if (terms && Settings.currentTerm) {
		if (!terms.find(e => e.id === Settings.currentTerm?.id)) {
			Settings.save({ currentTerm: terms[0] })
		}
	}
})

export const TotalsScreenTerm = observer(function TotalsScreenTerm({
	navigation,
}: TotalsContext) {
	Theme.key
	const totals = TotalsStore
	const subjects = SubjectsStore
	const education = EducationStore
	const renderItem = useCallback<ListRenderItem<Total>>(
		total => (
			<SubjectPerformanceInline
				attendance
				navigation={navigation}
				total={total.item}
				selectedTerm={Settings.currentTerm!}
				subjects={subjects.result!}
			/>
		),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	)
	const keyExtractor = useCallback(
		(total: Total): string => total.subjectId.toString(),
		[]
	)
	return (
		education.fallback ||
		subjects.fallback ||
		totals.fallback ||
		(totals.result === null || totals.result.length < 1 ? (
			<Loading text="Загрузка из кэша{dots}" />
		) : (
			<FlatList
				initialNumToRender={1}
				maxToRenderPerBatch={1}
				ListHeaderComponent={<TotalsScreenHeader />}
				data={TermStore.totalsResult}
				refreshControl={totals.refreshControl}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ListFooterComponent={
					<Text
						style={{
							color: Theme.colors.onSurfaceDisabled,
							margin: Spacings.s2,
							marginBottom: Spacings.s4,
							alignSelf: 'center',
						}}
					>
						{totals.updateDate}
					</Text>
				}
			/>
		))
	)
})

export type SubjectInfo = {
	total: Total
	selectedTerm: NSEntity
	attendance: boolean
	subjects: Subject[]
} & Pick<TotalsContext, 'navigation'>

const TotalsScreenHeader = observer(function TotalsScreenHeader() {
	const terms = TermStore.getTerms()
	return (
		<View>
			{terms && (
				<SelectDropdown
					{...dropdown()}
					data={terms}
					defaultValue={Settings.currentTerm}
					onSelect={v => Settings.save({ currentTerm: v })}
					dropdownStyle={[
						dropdownStyle(),
						{ maxWidth: 110, alignSelf: 'center' },
					]}
					defaultButtonText={Settings.currentTerm?.name ?? 'Выбери четверть'}
					buttonTextAfterSelection={i => i?.name ?? 'F'}
					rowTextForSelection={i => i?.name ?? 'F'}
				/>
			)}

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
		</View>
	)
})

