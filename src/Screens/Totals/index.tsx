import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Chip } from 'react-native-paper'
import { SubjectPerformance } from '../../NetSchool/classes'
import { Settings } from '../../Stores/Settings'
import { Spacings } from '../../utils/Spacings'
import SubjectTotals from '../SubjectTotals/index'
import TotalsScreenTerm from './Term/Screen'
import TotalsScreenTable from './TotalsScreenTable'
import {
	S_SUBJECT_TOTALS,
	S_TOTALS,
	Stack,
	TermNavigationParamMap,
} from './navigation'

export default observer(function TotalsNavigation() {
	return (
		<Stack.Navigator
			screenOptions={{
				animationEnabled: true,
				presentation: 'modal',
			}}
		>
			<Stack.Screen
				name={S_TOTALS}
				component={
					Settings.currentTotalsOnly ? TotalsScreenTerm : TotalsScreenTable
				}
				options={{
					headerRight,
					headerStyle: { elevation: 0 },
				}}
			/>
			<Stack.Screen
				component={SubjectTotals}
				name={S_SUBJECT_TOTALS}
				options={{
					headerStyle: { elevation: 0 },
				}}
			></Stack.Screen>
		</Stack.Navigator>
	)
})

function headerRight() {
	return <HeaderSwitch />
}

const HeaderSwitch = observer(function HeaderSwitch() {
	return (
		<View style={{ margin: Spacings.s2 }}>
			<Chip
				selected={!Settings.currentTotalsOnly}
				onPress={() =>
					Settings.save({
						currentTotalsOnly: !Settings.currentTotalsOnly,
					})
				}
			>
				Все четверти
			</Chip>
		</View>
	)
})

export type TotalsScreenParams = StackScreenProps<
	TermNavigationParamMap,
	typeof S_TOTALS
>

export type MarkInfo = Partial<
	Omit<
		SubjectPerformance['results'][number],
		'result' | 'assignmentId' | 'date'
	>
> & {
	date: string
	result: 'Нет' | number | string
	assignmentId: string | number
}
