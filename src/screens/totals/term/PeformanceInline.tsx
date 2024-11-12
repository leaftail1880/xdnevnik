import { observer } from 'mobx-react-lite'
import { TouchableOpacity } from 'react-native'
import { Surface } from 'react-native-paper'

import Loading from '~components/Loading'
import SubjectName from '~components/SubjectName'
import SubjectMarksInline from './MarksInline'

import { useCallback } from 'react'
import { LANG } from '~constants'
import { Theme } from '~models/theme'
import { Spacings } from '~utils/Spacings'
import { SubjectInfo } from './state'

export default observer(function SubjectPerformanceInline(props: SubjectInfo) {
	const term = props.total.termTotals.find(
		e => e.term.id === props.selectedTerm.id,
	)

	const openDetails = useCallback(
		() =>
			term &&
			props.navigation.navigate(LANG['s_subject_totals'], {
				termId: props.selectedTerm.id,
				finalMark: term.mark,
				subjectId: props.total.subjectId,
			}),
		[props.navigation, props.selectedTerm.id, props.total.subjectId, term],
	)

	if (!term) return false

	return (
		<Surface
			elevation={1}
			style={{
				margin: Spacings.s1,
				borderRadius: Theme.roundness * 2,
				flex: 1,
			}}
		>
			<TouchableOpacity onPress={openDetails}>
				<SubjectName
					subjectId={props.total.subjectId}
					subjects={props.subjects}
					style={{
						fontSize: 16,
						fontWeight: 'bold',
						marginHorizontal: Spacings.s2,
					}}
				/>
				{term ? (
					<SubjectMarksInline
						{...props}
						openDetails={openDetails}
						term={term}
					/>
				) : (
					<Loading />
				)}
			</TouchableOpacity>
		</Surface>
	)
})
