import { XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { SubjectsStore, TotalsStore } from '@/services/net-school/store'
import { StackNavigationOptions } from '@react-navigation/stack'
import { autorun, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { StyleSheet, View } from 'react-native'
import { Appbar, Chip, Searchbar } from 'react-native-paper'
import { Spacings } from '../../utils/Spacings'
import {
	S_SUBJECT_TOTALS,
	S_TOTALS,
	Stack,
	TotalsStateStore,
} from './navigation'
import SubjectTotals from './subject/screen'
import TotalsScreenTerm from './term/screen'
import TotalsScreenTable from './terms/TotalsScreenTable'

export default observer(function TotalsNavigation() {
	createSubjectAndTotalsStoreParamsAutorun()

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
					XSettings.currentTotalsOnly ? TotalsScreenTerm : TotalsScreenTable
				}
				options={totalsOptions}
			/>
			<Stack.Screen
				component={SubjectTotals}
				name={S_SUBJECT_TOTALS}
				options={subjectTotalsOptions}
			></Stack.Screen>
		</Stack.Navigator>
	)
})

const styles = StyleSheet.create({
	headerStyle: { elevation: 0 },
})

let autorunStarted = false

export function createSubjectAndTotalsStoreParamsAutorun() {
	if (!autorunStarted) {
		autorun(function totalsNavigation() {
			const { studentId } = XSettings

			if (TotalsStateStore.schoolYear && studentId) {
				const schoolYearId = TotalsStateStore.schoolYear.id

				SubjectsStore.withParams({ studentId, schoolYearId })
				TotalsStore.withParams({ schoolYearId, studentId })
			}
		})
		autorunStarted = true
	}
}

function headerRight() {
	return <HeaderSwitch />
}

function headerTitle() {
	return <HeaderSearch />
}

const HeaderSearch = observer(function HeaderSearch() {
	return (
		<Searchbar
			placeholder="Поиск"
			style={{ flex: 2 }}
			onChangeText={v => runInAction(() => (TotalsStateStore.search = v))}
			value={TotalsStateStore.search}
		/>
	)
})

const subjectTotalsOptions: StackNavigationOptions = {
	headerStyle: styles.headerStyle,
}
const totalsOptions: StackNavigationOptions = {
	headerRight,
	headerTitle,
	header() {
		return (
			<Appbar.Header
				style={{
					backgroundColor: Theme.colors.navigationBar,
				}}
				mode="center-aligned"
			>
				<HeaderSearch />
				<HeaderSwitch />
			</Appbar.Header>
		)
	},
}

const HeaderSwitch = observer(function HeaderSwitch() {
	return (
		<View style={{ margin: Spacings.s2 }}>
			<Chip
				selected={!XSettings.currentTotalsOnly}
				onPress={() =>
					XSettings.save({ currentTotalsOnly: !XSettings.currentTotalsOnly })
				}
			>
				Все четверти
			</Chip>
		</View>
	)
})
