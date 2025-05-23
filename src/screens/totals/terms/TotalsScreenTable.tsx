import Loading from '@/components/Loading'
import Mark from '@/components/Mark'
import SelectModal from '@/components/SelectModal'
import SubjectName from '@/components/SubjectName'
import UpdateDate from '@/components/UpdateDate'
import { Total } from '@/services/net-school/entities'
import {
	EducationStore,
	SubjectsStore,
	TotalsStore,
} from '@/services/net-school/store'
import { ModalAlert } from '@/utils/Toast'
import { runInAction, toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { ScrollView, View, ViewStyle } from 'react-native'
import { DataTable, Text } from 'react-native-paper'
import { LANG } from '../../../constants'
import { TotalsScreenParams, TotalsStateStore } from '../navigation'

export default observer(function TotalsScreenTable({
	navigation,
}: TotalsScreenParams) {
	if (EducationStore.fallback || SubjectsStore.fallback || TotalsStore.fallback)
		return (
			EducationStore.fallback || SubjectsStore.fallback || TotalsStore.fallback
		)

	const biggestTerm = TotalsStore.result
		.slice()
		.sort((a, b) => b.yearTotals.length - a.yearTotals.length)[0] as
		| Total
		| undefined

	const yearTotals = biggestTerm?.yearTotals.slice().reverse()
	const termTotalsSize = biggestTerm?.termTotals.length
	const yearTotalsSize = yearTotals?.length
	const flexSize =
		(termTotalsSize ? termTotalsSize : 1) +
		(yearTotalsSize ? yearTotalsSize : 1)

	return (
		<ScrollView
			contentContainerStyle={{ flex: 0 }}
			refreshControl={TotalsStore.refreshControl}
		>
			<DataTable style={{ alignSelf: 'center' }}>
				<DataTable.Header>
					<DataTable.Title style={{ flex: flexSize, padding: 0, margin: 0 }}>
						<SchoolYear />
					</DataTable.Title>

					{TotalsStore.result?.[0]?.termTotals.map((_, i, a) => (
						<DataTable.Title
							key={i.toString()}
							style={{
								justifyContent: 'center',
								alignContent: 'center',
								alignItems: 'center',
								flex: 1,
							}}
						>
							{i + 1}/{a.length}
						</DataTable.Title>
					))}

					{yearTotals?.length &&
						yearTotals?.map((year, i) => (
							<DataTable.Title
								key={i.toString()}
								style={{
									justifyContent: 'center',
									alignContent: 'center',
									alignItems: 'center',
									flex: 1,
								}}
								numberOfLines={flexSize > 4 ? 2 : undefined}
							>
								{year.period.periodName}
							</DataTable.Title>
						))}
				</DataTable.Header>
			</DataTable>

			{TotalsStore.result.map(total => (
				<DataTable.Row key={total.subjectId.toString()}>
					<DataTable.Cell style={{ flex: flexSize }}>
						<SubjectName
							// style={{ maxWidth: '80%' }}
							// viewStyle={{ width: '100%' }}
							subjectId={total.subjectId}
							subjects={SubjectsStore.result!}
						/>
					</DataTable.Cell>

					{total.termTotals.map((term, i) => (
						<DataTable.Cell key={i.toString() + term.avgMark + term.term.name}>
							<Mark
								style={{ flex: 0, height: '80%', width: '80%', padding: 0 }}
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

					{yearTotals?.length &&
						yearTotals?.map((targetYear, i) => {
							const style: ViewStyle = {
								flex: 0,
								height: '80%',
								width: '80%',
								padding: 0,
							}
							const year = total.yearTotals.find(
								e =>
									e.period.periodType === targetYear.period.periodType &&
									e.period.periodName === targetYear.period.periodName,
							)
							if (!year) {
								return (
									<DataTable.Cell
										key={i.toString() + targetYear.mark + targetYear.period.id}
									>
										<Mark
											style={style}
											duty={false}
											finalMark={null}
											mark={null}
										/>
									</DataTable.Cell>
								)
							}

							return (
								<DataTable.Cell key={i.toString() + year.mark + year.period.id}>
									<Mark
										style={style}
										duty={false}
										finalMark={year.mark}
										mark={year.mark}
										avgMarkWithFinal={false}
										onPress={() => {
											ModalAlert.show(
												'Итоги года',
												<View>
													<SubjectName
														subjectId={total.subjectId}
														subjects={SubjectsStore.result!}
													/>
													<Text>
														{year.period.periodName}: {year.mark}
													</Text>
												</View>,
											)
										}}
									/>
								</DataTable.Cell>
							)
						})}
				</DataTable.Row>
			))}
			<UpdateDate store={TotalsStore} />
		</ScrollView>
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
