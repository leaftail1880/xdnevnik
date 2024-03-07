import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { DataTable } from 'react-native-paper'
import { Loading } from '../../Components/Loading'
import { Mark } from '../../Components/Mark'
import { SubjectName } from '../../Components/SubjectName'
import { UpdateDate } from '../../Components/UpdateDate'
import { LANG } from '../../Setup/constants'
import {
	EducationStore,
	SubjectsStore,
	TotalsStore,
} from '../../Stores/NetSchool'
import { TotalsScreenParams } from './index'
import { TotalsStateStore } from './navigation'

export const TotalsScreenTable = observer(function TotalsScreenTable({
	navigation,
}: TotalsScreenParams) {
	return EducationStore.fallback ||
		SubjectsStore.fallback ||
		TotalsStore.fallback ||
		TotalsStore.result === null ||
		TotalsStore.result.length < 1 ||
		!TotalsStateStore.schoolYear ? (
		<Loading text="Загрузка из кэша{dots}" />
	) : (
		<ScrollView contentContainerStyle={{ flex: 0 }}>
			<DataTable style={{ alignSelf: 'center' }}>
				<DataTable.Header>
					<DataTable.Title style={{ flex: 3 }}>
						{new Date(TotalsStateStore.schoolYear.startDate).getFullYear()}/
						{new Date(TotalsStateStore.schoolYear.endDate).getFullYear()}{' '}
						Четверти
					</DataTable.Title>

					{TotalsStore.result[0].termTotals.map((_, i, a) => (
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
						<DataTable.Cell key={i.toString() + term.avgMark + term.term.name}>
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
})
