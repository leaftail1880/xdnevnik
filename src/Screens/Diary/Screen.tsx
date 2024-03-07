import { autorun, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { ScrollView, View } from 'react-native'
import { Chip, Text } from 'react-native-paper'
import { Dropdown } from '../../Components/Dropdown'
import { Header } from '../../Components/Header'
import { UpdateDate } from '../../Components/UpdateDate'
import {
	AssignmentsStore,
	AttachmentsStore,
	DiaryStore,
} from '../../Stores/NetSchool'
import { Settings } from '../../Stores/Settings'
import { Spacings } from '../../utils/Spacings'
import DiaryLesson, { DiaryLessonProps } from './Lesson'
import { DiaryState } from './StateStore'

autorun(() => {
	const { studentId } = Settings
	const { showHomework, weekDays } = DiaryState

	DiaryStore.withParams({
		studentId,
		startDate: weekDays[0].toNetSchool(),
		endDate: weekDays[6].toNetSchool(),
	})

	AssignmentsStore.withParams({
		studentId,
		classmeetingsIds: showHomework
			? DiaryStore.result?.lessons.map(e => e.classmeetingId)
			: undefined,
	})

	const withAttachments = AssignmentsStore.result
		?.filter(e => e.attachmentsExists)
		.map(e => e.assignmentId)

	AttachmentsStore.withParams({
		studentId,
		assignmentIds: withAttachments?.length ? withAttachments : undefined,
	})
})

export const DiaryScreen = observer(function DiaryScreen(props: Pick<DiaryLessonProps, 'navigation' | 'route'>) {
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
					{DiaryStore.fallback || <DiaryDay {...props}/>}
				</View>
				<UpdateDate store={DiaryStore} />
			</ScrollView>
		</View>
	)
})

const SelectDay = observer(function SelectDay() {
	return (
		<Dropdown
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
		[props.type]
	)

	return (
		<Chip
			mode="outlined"
			selected={DiaryState[props.type]}
			onPress={onPress}
			style={{ marginHorizontal: Spacings.s1 }}
		>
			{props.label}
		</Chip>
	)
})

const DiaryDay = observer(function DiaryDay(props: Pick<DiaryLessonProps, 'navigation' | 'route'>) {
	if (DiaryStore.fallback) return DiaryStore.fallback

	const day = DiaryStore.result.forDay(DiaryState.day)
	if (day.length === 0) {
		return (
			<Text
				variant="titleMedium"
				style={{ textAlign: 'center', margin: Spacings.s4 }}
			>
				Уроков нет
			</Text>
		)
	}

	return day
		.sort((a, b) => a.order - b.order)
		.map(lesson => (
			<DiaryLesson key={lesson.classmeetingId.toString()} lesson={lesson} {...props} />
		))
})
