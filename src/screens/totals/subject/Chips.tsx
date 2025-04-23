import { Chips } from '@/components/Chips'
import { SubjectPerformance } from '@/services/net-school/entities'
import { ToGetMarkTargetCalculated } from '@/utils/calculateMarks'
import { setInAction } from '@/utils/setInAction'
import { Spacings } from '@/utils/Spacings'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { StyleSheet } from 'react-native'
import { Chip } from 'react-native-paper'
import { ToGetMarkChips } from '../term/ToGetMarkChip'
import { SubjectTotalsState } from './state'

export const SubjectTotalsTopChips = observer(function TopChips(props: {
	toGetMarks: ToGetMarkTargetCalculated[]
	performance: SubjectPerformance
}) {
	return (
		<Chips
			style={{
				marginRight: Spacings.s2,
				paddingVertical: 0,
			}}
		>
			<ToGetMarkChips toGetMarks={props.toGetMarks} />
			{props.performance.classmeetingsStats.passed !== 0 && (
				<>
					<Chip
						mode="flat"
						compact
						selected={SubjectTotalsState.attendance}
						onPress={() =>
							setInAction(SubjectTotalsState, {
								attendance: !SubjectTotalsState.attendance,
							})
						}
					>
						Посещаемость
					</Chip>
					<Chip
						mode="flat"
						compact
						selected={SubjectTotalsState.lessonsWithoutMark}
						onPress={() =>
							setInAction(SubjectTotalsState, {
								lessonsWithoutMark: !SubjectTotalsState.lessonsWithoutMark,
							})
						}
					>
						Уроки без оценок
					</Chip>
				</>
			)}
		</Chips>
	)
})

const styles = StyleSheet.create({
	paddingVertical0: { paddingVertical: 0 },
})

export const SubjectTotalsBottomChips = observer(function BottomChips(props: {
	length: number
	totalsTypes: Set<string>
}) {
	return (
		<Chips style={styles.paddingVertical0}>
			{props.length > 7 && (
				<Chip
					mode="flat"
					compact
					selected={SubjectTotalsState.collapsed}
					onPress={() =>
						setInAction(SubjectTotalsState, {
							collapsed: !SubjectTotalsState.collapsed,
						})
					}
				>
					Свернуть старые оценки
				</Chip>
			)}
			{props.totalsTypes.size &&
				[...props.totalsTypes].map(type => (
					<Chip
						onPress={() =>
							runInAction(() => {
								if (SubjectTotalsState.disabledTotalTypes.has(type))
									SubjectTotalsState.disabledTotalTypes.delete(type)
								else SubjectTotalsState.disabledTotalTypes.add(type)
							})
						}
						selected={!SubjectTotalsState.disabledTotalTypes.has(type)}
						mode="flat"
						compact
						key={type}
					>
						{type}
					</Chip>
				))}
		</Chips>
	)
})
