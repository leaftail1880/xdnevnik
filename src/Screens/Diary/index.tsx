import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { Spacings, Switch, Text, View } from 'react-native-ui-lib'
import { Dropdown } from '../../Components/Dropdown'
import { XDnevnik } from '../../Stores/Xdnevnik.store'
import { logger } from '../../constants'
import { DiaryLesson } from './Lesson'
import {
	AssignmentsStore,
	AttachmentsStore,
	DiaryStateStore,
	DiaryStore,
} from './stores'

export const DiaryScreen = observer(function DiaryScreen() {
	const { studentId } = XDnevnik
	const { showHomework, weekDays, weekDaysOptions, diaryDay } = DiaryStateStore

	const diary = DiaryStore.withParams({
		studentId,
		startDate: weekDays[0],
		endDate: weekDays[6],
	})

	logger.debug(
		'Дневник fallback ' + !!diary.fallback + ' result ' + !!diary.result
	)

	const homework = AssignmentsStore.withParams({
		studentId,
		classmeetingsIds: showHomework
			? diary.result?.lessons.map(e => e.classmeetingId)
			: undefined,
	})

	const withAttachments = homework.result
		?.filter(e => e.attachmentsExists)
		.map(e => e.assignmentId)

	AttachmentsStore.withParams({
		studentId,
		assignmentIds: withAttachments?.length ? withAttachments : undefined,
	})

	return (
		<View>
			<Dropdown
				dropdownStyle={{ minHeight: 350, borderRadius: 10 }}
				data={weekDaysOptions}
				defaultButtonText="День недели"
				buttonTextAfterSelection={i => i.name}
				renderCustomizedRowChild={i => (
					<Text $textDisabled={i.selected} center>
						{i.name}
					</Text>
				)}
				defaultValue={weekDaysOptions.find(e => e.day === diaryDay)}
				onSelect={item => {
					runInAction(() => {
						if ('week' in item) DiaryStateStore.weekDate = item.week
						DiaryStateStore.diaryDay = item.day
					})
				}}
			/>
			<ScrollView
				contentContainerStyle={{
					justifyContent: 'center',
					alignContent: 'center',
					paddingBottom: Spacings.s10,
				}}
				refreshControl={diary.refreshControl}
			>
				<View padding-s1 flex>
					<View flex row spread padding-s1>
						<Text margin-s1>Оценки</Text>
						<Switch
							margin-s1
							onValueChange={v => (DiaryStateStore.showHomework = v)}
							value={showHomework}
						/>
					</View>
				</View>
				<View padding-s1>{diary.fallback || <DiaryDay />}</View>
				<Text center $textDisabled marginB-20>
					{diary.updateDate}
				</Text>
			</ScrollView>
		</View>
	)
})
const DiaryDay = observer(function DiaryDay() {
	const { result, fallback } = DiaryStore.withoutParams()

	if (fallback) return fallback

	const { diaryDay } = DiaryStateStore
	const day = result.forDay(diaryDay)
	if (day.length === 0)
		return (
			<Text center text30>
				Уроков нет
			</Text>
		)

	return day
		.sort((a, b) => a.order - b.order)
		.map(lesson => (
			<DiaryLesson key={lesson.classmeetingId.toString()} lesson={lesson} />
		))
})
