import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { ScrollView } from 'react-native'
import SelectDropdown from 'react-native-select-dropdown'
import { Colors, Switch, Text, View } from 'react-native-ui-lib'
import { TotalsContext } from '.'
import { dropdownButtonStyle, dropdownStyle } from '../../Components/Dropdown'
import { Loading } from '../../Components/Loading'
import { NSEntity, Subject, Total } from '../../NetSchool/classes'
import {
	EducationStore,
	SubjectPerformanceStores,
	SubjectsStore,
	TotalsStore,
} from '../../Stores/API.stores'
import { Settings } from '../../Stores/Settings.store'
import { Theme } from '../../Stores/Theme.store'
import { XDnevnik } from '../../Stores/Xdnevnik.store'
import { SubjectPerformanceInline } from './SubjectPerformanceInline'

const TermStore = new (class {
	sort = true
	getTerms(totals = TotalsStore) {
		return totals.result?.[0]?.termTotals.map(e => e.term)
	}
	get totalsResult() {
		const selectedTerm = Settings.currentTerm
		if (!TotalsStore.result || !selectedTerm) return

		return TotalsStore.result
			.slice()
			.sort((a, b) => getTermSortValue(a) - getTermSortValue(b))

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
					studentId: XDnevnik.studentId,
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
	const terms = TermStore.getTerms()
	const [attendance, setAttendance] = useState(false)

	return (
		education.fallback ||
		subjects.fallback ||
		totals.fallback || (
			<ScrollView
				contentContainerStyle={{ alignItems: 'center' }}
				refreshControl={totals.refreshControl}
			>
				{terms && (
					<SelectDropdown
						data={terms}
						defaultValue={Settings.currentTerm}
						onSelect={v => Settings.save({ currentTerm: v })}
						buttonStyle={dropdownButtonStyle()}
						buttonTextStyle={{ color: Colors.$textPrimary }}
						dropdownStyle={[
							dropdownStyle(),
							{ maxWidth: 110, alignSelf: 'center' },
						]}
						defaultButtonText={Settings.currentTerm?.name ?? 'Выбери четверть'}
						buttonTextAfterSelection={i => i?.name ?? 'F'}
						rowTextForSelection={i => i?.name ?? 'F'}
					/>
				)}
				<View flex style={{ width: '90%' }}>
					<View flex row spread padding-s1>
						<Text margin-s1 key={Theme.key}>
							Сначала плохие оценки
						</Text>
						<Switch
							margin-s1
							onValueChange={(a: boolean) =>
								runInAction(() => (TermStore.sort = a))
							}
							value={TermStore.sort}
							key={Theme.key + 's'}
						/>
					</View>
					<View flex row spread padding-s1>
						<Text margin-s1 key={Theme.key}>
							Пропуски
						</Text>
						<Switch
							margin-s1
							onValueChange={setAttendance}
							value={attendance}
							key={Theme.key + 's'}
						/>
					</View>
				</View>
				{totals.result === null || totals.result.length < 1 ? (
					<Loading text="Загрузка из кэша{dots}" />
				) : (
					TermStore.totalsResult &&
					TermStore.totalsResult.map(total => (
						<SubjectPerformanceInline
							attendance={attendance}
							navigation={navigation}
							total={total}
							selectedTerm={Settings.currentTerm!}
							subjects={subjects.result}
							key={total.subjectId.toString()}
						/>
					))
				)}
				<Text $textDisabled center margin-s1>
					{totals.updateDate}
				</Text>
				<View padding-s7></View>
			</ScrollView>
		)
	)
})

export type SubjectInfo = {
	total: Total
	selectedTerm: NSEntity
	attendance: boolean
	subjects: Subject[]
} & Pick<TotalsContext, 'navigation'>
