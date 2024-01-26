import { observer } from 'mobx-react-lite'
import { Colors, Spacings, View } from 'react-native-ui-lib'
import { Loading } from '../../Components/Loading'
import { Mark } from '../../Components/Mark'
import { SubjectName } from '../../Components/SubjectName'
import { LANG } from '../../Setup/constants'
import { SubjectMarksInline } from './SubjectMarksInline'
import { SubjectInfo } from './TotalsScreenTerm'

export const SubjectPerformanceInline = observer(
	function SubjectPerformanceInline(props: SubjectInfo) {
		const term = props.total.termTotals.find(
			e => e.term.id === props.selectedTerm.id
		)

		if (!term) return <Loading text="Загрузка четверти{dots}" />

		const openDetails = () =>
			props.navigation.navigate(LANG['s_subject_totals'], {
				termId: props.selectedTerm.id,
				finalMark: term.mark,
				subjectId: props.total.subjectId,
			})

		return (
			<View
				br20
				margin-s2
				style={{
					elevation: 10,
					width: '98%',
					backgroundColor: Colors.$backgroundPrimaryLight,
				}}
			>
				<SubjectName
					subjectId={props.total.subjectId}
					subjects={props.subjects}
					iconsSize={18}
					flex
					style={{
						maxWidth: '90%',

						fontSize: 18,
						color: Colors.$textDefault,
						fontWeight: 'bold',
					}}
					viewStyle={{
						padding: Spacings.s2,
						paddingTop: Spacings.s1,
					}}
				/>
				{term ? (
					<View flex row style={{ width: '100%' }}>
						<View flex row style={{ alignItems: 'flex-end' }}>
							<SubjectMarksInline
								{...props}
								openDetails={openDetails}
								term={term}
							/>
						</View>
						<View
							row
							spread
							backgroundColor={Colors.$backgroundPrimaryLight}
							padding-s1
							br20
						>
							<Mark
								duty={false}
								noColor={Colors.$backgroundDefault}
								finalMark={term?.mark}
								mark={term.avgMark}
								onPress={openDetails}
								style={{ height: 50, width: 50, alignSelf: 'center' }}
							/>
						</View>
					</View>
				) : (
					<Loading />
				)}
			</View>
		)
	}
)
