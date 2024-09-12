import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Surface } from 'react-native-paper'

import Loading from '~components/Loading'
import Mark from '~components/Mark'
import SubjectName from '~components/SubjectName'
import SubjectMarksInline from './MarksInline'

import { Theme } from '~models/theme'
import { LANG } from '../../../constants'
import { Spacings } from '../../../utils/Spacings'
import { SubjectInfo } from './state'

export default observer(function SubjectPerformanceInline(props: SubjectInfo) {
	const term = props.total.termTotals.find(
		e => e.term.id === props.selectedTerm.id,
	)

	if (!term) return false

	const openDetails = () =>
		props.navigation.navigate(LANG['s_subject_totals'], {
			termId: props.selectedTerm.id,
			finalMark: term.mark,
			subjectId: props.total.subjectId,
		})

	return (
		<Surface
			elevation={1}
			style={{
				margin: Spacings.s1,
				borderRadius: Theme.roundness * 2,
				flex: 1,
			}}
		>
			<SubjectName
				subjectId={props.total.subjectId}
				subjects={props.subjects}
				iconsSize={16}
				style={{
					fontSize: 16,
					fontWeight: 'bold',
					margin: 0,
					marginHorizontal: Spacings.s2,
				}}
			/>
			{term ? (
				<View
					style={{
						width: '100%',
						flexDirection: 'row',
						paddingHorizontal: Spacings.s1,
						paddingBottom: Spacings.s1,
					}}
				>
					<SubjectMarksInline
						{...props}
						openDetails={openDetails}
						term={term}
					/>
					<Mark
						duty={false}
						finalMark={term?.mark}
						mark={term.avgMark}
						onPress={openDetails}
						textStyle={{ fontSize: 18 }}
						subTextStyle={{ fontSize: 8 }}
						style={{ padding: Spacings.s2, alignSelf: 'center' }}
					/>
				</View>
			) : (
				<Loading />
			)}
		</Surface>
	)
})
