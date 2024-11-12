import { StackScreenProps } from '@react-navigation/stack'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Chip } from 'react-native-paper'
import Header from '~components/Header'
import SelectModal from '~components/SelectModal'
import UpdateDate from '~components/UpdateDate'
import { Lesson } from '~services/net-school/entities'
import { DiaryStore } from '~services/net-school/store'
import { ParamListBase } from '../../../App'
import { Spacings } from '../../utils/Spacings'
import Day from './Day'
import { DiaryState } from './state'

export default observer(function DiaryScreen(
	props: Pick<DiaryLessonProps, 'navigation' | 'route'>,
) {
	return (
		<View style={{ flex: 1 }}>
			<Header title="Дневник"></Header>
			<SelectDay />
			<ScrollView
				contentContainerStyle={{
					justifyContent: 'center',
					alignContent: 'center',
				}}
				refreshControl={DiaryStore.refreshControl}
			>
				<View style={{ flex: 1, flexDirection: 'row', padding: Spacings.s2 }}>
					<Filter type="showHomework" label="Оценки" />
					<Filter type="showAttachments" label="Файлы" />
					<Filter type="showLessonTheme" label="Темы" />
				</View>
				<View style={{ padding: Spacings.s1 }}>
					{DiaryStore.fallback || <Day {...props} />}
				</View>
				<UpdateDate store={DiaryStore} />
			</ScrollView>
		</View>
	)
})

const SelectDay = observer(function SelectDay() {
	return (
		<SelectModal
			label="День"
			mode="button"
			data={DiaryState.weekDaysDropdown}
			value={DiaryState.day}
			onSelect={item =>
				runInAction(() => {
					if ('week' in item) DiaryState.week = item.week
					DiaryState.day = item.value
				})
			}
		/>
	)
})

type FilterProps = {
	type: keyof FilterObject<typeof DiaryState, boolean>
	label: string
}

const Filter = observer(function Filter(props: FilterProps) {
	const onPress = useCallback(
		() =>
			runInAction(() => {
				DiaryState[props.type] = !DiaryState[props.type]
			}),
		[props.type],
	)

	return (
		<Chip
			mode="flat"
			selected={DiaryState[props.type]}
			onPress={onPress}
			style={styles.filter}
		>
			{props.label}
		</Chip>
	)
})

const styles = StyleSheet.create({
	filter: { marginHorizontal: Spacings.s1 },
})

export type DiaryLessonProps = {
	lesson: Lesson
} & StackScreenProps<ParamListBase>
