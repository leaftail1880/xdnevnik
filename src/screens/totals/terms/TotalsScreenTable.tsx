import { runInAction, toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { DataTable } from 'react-native-paper'
import Loading from '~components/Loading'
import Mark from '~components/Mark'
import SelectModal from '~components/SelectModal'
import SubjectName from '~components/SubjectName'
import UpdateDate from '~components/UpdateDate'
import {
	EducationStore,
	SubjectsStore,
	TotalsStore,
} from '~services/net-school/store'
import { LANG } from '../../../constants'
import { TotalsScreenParams, TotalsStateStore } from '../navigation'

export default observer(function TotalsScreenTable({
	navigation,
}: TotalsScreenParams) {
	return (
		EducationStore.fallback ||
		SubjectsStore.fallback ||
		TotalsStore.fallback || (
			<ScrollView
				contentContainerStyle={{ flex: 0 }}
				refreshControl={TotalsStore.refreshControl}
			>
				<DataTable style={{ alignSelf: 'center' }}>
					<DataTable.Header>
						<DataTable.Title style={{ flex: 3, padding: 0, margin: 0 }}>
							<SchoolYear />
						</DataTable.Title>

						{TotalsStore.result?.[0]?.termTotals.map((_, i, a) => (
							<DataTable.Title
								key={i.toString()}
								style={{
									justifyContent: 'center',
									alignContent: 'center',
									alignItems: 'center',
								}}
							>
								{i + 1}/{a.length}
							</DataTable.Title>
						))}
					</DataTable.Header>
				</DataTable>

				{TotalsStore.result.map(total => (
					<DataTable.Row key={total.subjectId.toString()}>
						<DataTable.Cell style={{ flex: 3 }}>
							<SubjectName
								style={{ maxWidth: '80%' }}
								viewStyle={{ width: '100%' }}
								subjectId={total.subjectId}
								subjects={SubjectsStore.result!}
								iconsSize={14}
							/>
						</DataTable.Cell>

						{total.termTotals.map((term, i) => (
							<DataTable.Cell
								key={i.toString() + term.avgMark + term.term.name}
							>
								<Mark
									style={{ width: '80%', height: '80%', flex: 0 }}
									duty={false}
									finalMark={term.mark}
									mark={term.avgMark}
									onPress={() => {
										navigation.navigate(LANG['s_subject_totals'], {
											termId: term.term.id,
											finalMark: term.mark,
											subjectId: total.subjectId,
										})
									}}
								/>
							</DataTable.Cell>
						))}
					</DataTable.Row>
				))}
				<UpdateDate store={TotalsStore} />
			</ScrollView>
		)
	)
})

const SchoolYear = observer(function SchoolYear() {
	const { schoolYear } = TotalsStateStore
	const education = EducationStore.result
	if (!education || !schoolYear) return <Loading />

	return (
		<SelectModal
			mode="chip"
			label={'Год'}
			value={schoolYear.id + ''}
			data={TotalsStateStore.years}
			onSelect={v =>
				runInAction(() => (TotalsStateStore.schoolYear = toJS(v.year)))
			}
		/>
	)
})
