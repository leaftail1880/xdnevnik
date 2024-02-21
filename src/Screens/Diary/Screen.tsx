import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { ScrollView, View } from 'react-native'
import { Chip, Text } from 'react-native-paper'
import SelectDropdown from 'react-native-select-dropdown'
import { dropdown, dropdownStyle } from '../../Components/Dropdown'
import { Header } from '../../Components/Header'
import { Spacings } from '../../Components/Spacings'
import {
	AssignmentsStore,
	AttachmentsStore,
	DiaryStore,
} from '../../Stores/API'
import { Theme } from '../../Stores/Theme'
import { XDnevnik } from '../../Stores/Xdnevnik.store'
import { DiaryLesson } from './Lesson'
import { DiaryState } from './StateStore'

export const DiaryScreen = observer(function DiaryScreen() {
	const { studentId } = XDnevnik
	const { showHomework, weekDays, weekDaysDropdown, day } = DiaryState

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

	return (
		<View style={{ flex: 1 }}>
			<Header title="Дневник"></Header>
			<SelectDropdown
				{...dropdown()}
				dropdownStyle={{
					...dropdownStyle(),
					minHeight: 350,
				}}
				renderCustomizedButtonChild={selected => {
					return (
						<View>
							<Text variant="titleMedium" style={{ alignSelf: 'center' }}>
								{selected?.name ?? 'День недели'}
							</Text>
						</View>
					)
				}}
				data={weekDaysDropdown}
				defaultButtonText="День недели"
				buttonTextAfterSelection={i => i.name}
				renderCustomizedRowChild={i => (
					<Text
						style={{
							alignSelf: 'center',
							color: i.selected
								? Theme.colors.onSurfaceDisabled
								: Theme.colors.onSurface,
						}}
					>
						{i.name}
					</Text>
				)}
				defaultValue={weekDaysDropdown.find(e => e.day === day)}
				onSelect={item => {
					runInAction(() => {
						if ('week' in item) DiaryState.week = item.week
						DiaryState.day = item.day
					})
				}}
			/>
			<ScrollView
				contentContainerStyle={{
					justifyContent: 'center',
					alignContent: 'center',
				}}
				refreshControl={DiaryStore.refreshControl}
			>
				<View style={{ flex: 1, flexDirection: 'row', padding: Spacings.s2 }}>
					<DiaryChip state="showHomework" label="Оценки" />
					<DiaryChip state="showAttachments" label="Файлы" />
					<DiaryChip state="showLessonTheme" label="Темы" />
				</View>
				<View style={{ padding: Spacings.s1 }}>
					{DiaryStore.fallback || <DiaryDay />}
				</View>
				<Text
					style={{
						alignSelf: 'center',
						color: Theme.colors.onSurfaceDisabled,
						marginBottom: Spacings.s3,
					}}
				>
					{DiaryStore.updateDate}
				</Text>
			</ScrollView>
		</View>
	)
})

const DiaryChip = observer(function DiaryChip(props: {
	state: keyof FilterObject<typeof DiaryState, boolean>
	label: string
}) {
	const enabled = DiaryState[props.state]
	return (
		<Chip
			mode="outlined"
			selected={enabled}
			onPress={() =>
				runInAction(() => {
					DiaryState[props.state] = !enabled
				})
			}
			style={{ marginHorizontal: Spacings.s1 }}
		>
			{props.label}
		</Chip>
	)
})

const DiaryDay = observer(function DiaryDay() {
	const { result, fallback } = DiaryStore

	if (fallback) return fallback

	const { day: diaryDay } = DiaryState
	const day = result.forDay(diaryDay)
	if (day.length === 0) {
		return <Text variant="displayMedium">Уроков нет</Text>
	}

	return day
		.sort((a, b) => a.order - b.order)
		.map(lesson => (
			<DiaryLesson key={lesson.classmeetingId.toString()} lesson={lesson} />
		))
})
