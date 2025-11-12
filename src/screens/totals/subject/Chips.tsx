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
import { SubjectTotalsStore } from './state'

export const SubjectTotalsTopChips = observer(
	function SubjectTotalsTopChips(props: {
		toGetMarks: ToGetMarkTargetCalculated[]
		performance: SubjectPerformance,
    store: SubjectTotalsStore
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
							selected={props.store.attendance}
							onPress={() =>
								setInAction(props.store, {
									attendance: !props.store.attendance,
								})
							}
						>
							Посещаемость
						</Chip>
						<Chip
							mode="flat"
							compact
							selected={props.store.lessonsWithoutMark}
							onPress={() =>
								setInAction(props.store, {
									lessonsWithoutMark: !props.store.lessonsWithoutMark,
								})
							}
						>
							Уроки без оценок
						</Chip>
					</>
				)}
			</Chips>
		)
	},
)

const styles = StyleSheet.create({
	paddingVertical0: { paddingVertical: 0 },
})

export const SubjectTotalsBottomChips = observer(
	function SubjectTotalsBottomChips(props: {
		length: number
		totalsTypes: Set<string>,
    store: SubjectTotalsStore
	}) {
		return (
			<Chips style={styles.paddingVertical0}>
				{/* {props.length > 7 && (
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
			)} */}
				{props.totalsTypes.size
					? [...props.totalsTypes].map(type => (
							<Chip
								onPress={() =>
									runInAction(() => {
										if (props.store.disabledTotalTypes.has(type))
											props.store.disabledTotalTypes.delete(type)
										else props.store.disabledTotalTypes.add(type)
									})
								}
								selected={!props.store.disabledTotalTypes.has(type)}
								mode="flat"
								compact
								key={type}
							>
								{type}
							</Chip>
						))
					: null}
			</Chips>
		)
	},
)
