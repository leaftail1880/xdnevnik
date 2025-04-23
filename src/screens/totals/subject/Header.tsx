import Mark from '@/components/Mark'
import SubjectName from '@/components/SubjectName'
import { globalStyles } from '@/constants'
import { SubjectPerformance } from '@/services/net-school/entities'
import { Spacings } from '@/utils/Spacings'
import { useStyles } from '@/utils/useStyles'
import { observer } from 'mobx-react-lite'
import { StyleSheet, View } from 'react-native'

export const SubjectScreenHeader = observer(
	function SubjectScreenHeader(props: {
		performance: SubjectPerformance
		finalMark: number | null | string
		avgMark: number
	}) {
		const containerStyle = useStyles(theme => [
			globalStyles.stretch,
			{
				flexWrap: 'wrap',
				padding: Spacings.s2,
				backgroundColor: theme.colors.navigationBar,
				borderBottomLeftRadius: theme.roundness,
				borderBottomRightRadius: theme.roundness,
				elevation: 2,
			},
		])

		return (
			<View style={containerStyle}>
				<SubjectName
					subjectName={props.performance.subject.name}
					subjectId={props.performance.subject.id}
					style={styles.subjectName}
				/>
				<Mark
					duty={false}
					finalMark={props.finalMark}
					mark={props.avgMark}
					style={styles.markStyle}
					textStyle={styles.markTextStyle}
				/>
			</View>
		)
	},
)

const styles = StyleSheet.create({
	markStyle: {
		padding: Spacings.s2,
	},
	markTextStyle: { fontSize: 18 },
	subjectName: {
		fontSize: 18,
		fontWeight: 'bold',
		margin: Spacings.s1,
	},
})
