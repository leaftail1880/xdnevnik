import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { DataTable, Text } from 'react-native-paper'
import { Loading } from '../../Components/Loading'
import { Mark } from '../../Components/Mark'
import { Spacings } from '../../Components/Spacings'
import { SubjectName } from '../../Components/SubjectName'
import { LANG } from '../../Setup/constants'
import { EducationStore, SubjectsStore, TotalsStore } from '../../Stores/API'
import { Theme } from '../../Stores/Theme'
import { TotalsContext } from './index'

export const TotalsScreenTable = observer(function TotalsScreenTable(
	props: TotalsContext
) {
	const totals = TotalsStore
	const subjects = SubjectsStore
	const education = EducationStore
	const { schoolYear } = props

	return education.fallback ||
		subjects.fallback ||
		totals.fallback ||
		totals.result.length < 1 ? (
		<Loading text="Загрузка из кэша{dots}" />
	) : (
		<ScrollView contentContainerStyle={{ flex: 0 }}>
			<DataTable style={{ alignSelf: 'center' }}>
				<DataTable.Header>
					<DataTable.Title style={{ flex: 3 }}>
						{new Date(schoolYear!.startDate).getFullYear()}/
						{new Date(schoolYear!.endDate).getFullYear()} Четверти
					</DataTable.Title>

					{totals.result[0].termTotals.map((_, i, a) => (
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

			{totals.result.map(total => (
				<DataTable.Row key={total.subjectId.toString()}>
					<DataTable.Cell style={{ flex: 3 }}>
						<SubjectName
							style={{ maxWidth: '80%' }}
							viewStyle={{ width: '100%' }}
							subjectId={total.subjectId}
							subjects={subjects.result!}
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
									props.navigation.navigate(LANG['s_subject_totals'], {
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
			<Text
				style={{
					color: Theme.colors.onSurfaceDisabled,
					marginBottom: Spacings.s4,
					margin: Spacings.s2,
					alignSelf: 'center',
				}}
			>
				{totals.updateDate}
			</Text>
		</ScrollView>
	)
})
