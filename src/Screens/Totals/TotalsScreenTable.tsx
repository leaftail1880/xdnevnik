import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { Colors, Text, View } from 'react-native-ui-lib'
import { TotalsContext } from '.'
import { Loading } from '../../Components/Loading'
import { Mark } from '../../Components/Mark'
import { SubjectName } from '../../Components/SubjectName'
import { LANG, styles } from '../../Setup/constants'
import {
	EducationStore,
	SubjectsStore,
	TotalsStore,
} from '../../Stores/API.stores'

export const TotalsScreenTable = observer(function TotalsScreenTable(
	props: TotalsContext
) {
	const totals = TotalsStore
	const subjects = SubjectsStore
	const education = EducationStore
	const { schoolYear } = props
	const headerWidth = 45
	const termTotalWidth =
		totals.result &&
		totals.result[0] &&
		(`${~~(
			(100 - headerWidth) /
			totals.result[0].termTotals.length
		)}%` as const)

	return education.fallback ||
		subjects.fallback ||
		totals.fallback ||
		totals.result.length < 1 ? (
		<Loading text="Загрузка из кэша{dots}" />
	) : (
		<ScrollView contentContainerStyle={styles.table}>
			{/* Table head */}
			<View
				style={{
					...styles.tableRow,
					backgroundColor: Colors.$backgroundPrimaryHeavy,
				}}
			>
				{/* Table first row */}
				<Text $textAccent style={{ width: `${headerWidth}%` }}>
					{new Date(schoolYear!.startDate).getFullYear()}/
					{new Date(schoolYear!.endDate).getFullYear()} Четверти
				</Text>

				{/* Table rows */}
				{totals.result[0].termTotals.map((_, i, a) => (
					<Text
						$textAccent
						style={{ width: termTotalWidth }}
						key={i.toString()}
					>
						{i + 1}/{a.length}
					</Text>
				))}
			</View>

			{/* Table body */}
			{totals.result.map(total => (
				<View
					style={{ ...styles.tableRow, padding: 0 }}
					key={total.subjectId.toString()}
				>
					{/* Table first row */}
					<View
						style={{
							...styles.tableCell,
							width: `${headerWidth}%`,
						}}
					>
						<SubjectName
							iconsSize={16}
							subjectId={total.subjectId}
							subjects={subjects.result!}
							style={{
								color: Colors.$textDefault,
							}}
						/>
					</View>

					{/* Table rows */}
					{total.termTotals.map((term, i) => (
						<Mark
							duty={false}
							finalMark={term.mark}
							mark={term.avgMark}
							style={{
								...styles.tableCell,
								width: termTotalWidth,
							}}
							onPress={() => {
								props.navigation.navigate(LANG['s_subject_totals'], {
									termId: term.term.id,
									finalMark: term.mark,
									subjectId: total.subjectId,
								})
							}}
							key={i.toString() + term.avgMark + term.term.name}
						/>
					))}
				</View>
			))}
			<Text $textDisabled center margin-s1>
				{totals.updateDate}
			</Text>
		</ScrollView>
	)
})
