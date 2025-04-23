import { ChipLike } from '@/components/ChipLike'
import { getSubjectName } from '@/components/SubjectName'
import { globalStyles } from '@/constants'
import { StudentSettings, XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { Lesson } from '@/services/net-school/lesson'
import { DiaryStore } from '@/services/net-school/store'
import { Spacings } from '@/utils/Spacings'
import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import {
	ListRenderItem,
	StyleSheet,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from 'react-native'
import { Button, Text } from 'react-native-paper'
import ReorderableList, {
	ReorderableListReorderEvent,
	useReorderableDrag,
} from 'react-native-reorderable-list'
import { LessonTimeChip } from '../Lesson'
import { DAY_NAMES_SHORT } from '../state'
import { setLessonTimeOffset } from './state'

const reorderState = new (class {
	constructor() {
		makeAutoObservable(this, {}, { autoBind: true })
	}

	key = 0
	lessons: Lesson[] = []

	reset() {
		const studentSettings = XSettings.forStudentOrThrow()
		studentSettings.lessonOrder = {}

		this.key++
		this.lessons = []
	}
})()

function replaceItems<T>(array: T[], from: number, to: number): T[] {
	array = array.slice()
	;[array[from], array[to]] = [array[to], array[from]]
	return array
}

export const EditDiaryReorderLessons = observer(function DiaryEditDay() {
	const lessons = DiaryStore.result!.lessons
	const studentSettings = XSettings.forStudentOrThrow()
	const lessonsSorted =
		reorderState.lessons.length === 0
			? sortByDate(lessons.slice(), studentSettings)
			: reorderState.lessons

	const onReorder = useCallback(
		(args: ReorderableListReorderEvent) => {
			runInAction(() => {
				reorderState.lessons = replaceItems(lessonsSorted, args.from, args.to)
				reorderState.key++
				const { to, offset, from } = getOffset(
					lessonsSorted,
					args.from,
					args.to,
				)

				setLessonTimeOffset(to, offset, studentSettings)
				setLessonTimeOffset(from, -offset, studentSettings)
			})
		},
		[lessonsSorted, studentSettings],
	)

	return (
		<View>
			<View style={localStyles.padding}>
				<Text>
					Для изменения порядка предметов удерживайте предмет и перетащите его
					на место того, который нужно заменить.
				</Text>
				<Button onPress={reorderState.reset}>Сбросить</Button>
			</View>
			<ReorderableList
				data={lessonsSorted}
				keyExtractor={keyExtractor}
				renderItem={RenderDiaryLessonDraggable}
				onReorder={onReorder}
				contentContainerStyle={localStyles.reordableList}
				key={reorderState.key.toString()}
			/>
		</View>
	)
})

const localStyles = StyleSheet.create({
	reordableList: {
		paddingHorizontal: Spacings.s1,
	},
	padding: { padding: Spacings.s2 },
})

function keyExtractor(lesson: Lesson) {
	return lesson.classmeetingId.toString()
}

function getOffset(
	lessonsSorted: Lesson[],
	toIndex: number,
	fromIndex: number,
) {
	const to = lessonsSorted[toIndex]
	const from = lessonsSorted[fromIndex]
	const offset = from.startDate.getTime() - to.startDate.getTime()
	return { to, offset, from }
}

const DiaryLessonDraggable = observer(function DraggableLesson({
	item: lesson,
}: {
	item: Lesson
}) {
	const drag = useReorderableDrag()

	return <DiaryLessonShort onLongPress={drag} lesson={lesson} />
})

export const DiaryLessonShort = observer(function DraggableLesson({
	lesson: lesson,
	isEdited,
	...props
}: {
	lesson: Lesson
	isEdited?: boolean
} & TouchableOpacityProps) {
	const studentSettings = XSettings.forStudentOrThrow()
	const isMoved =
		!!studentSettings.lessonOrder[lesson.offsetId]?.[lesson.subjectId]

	return (
		<TouchableOpacity
			style={[
				{
					backgroundColor:
						isEdited || isMoved
							? Theme.colors.primaryContainer
							: Theme.colors.elevation.level1,
				},
				globalStyles.row,
				{
					gap: Spacings.s1,
					alignItems: 'center',
					paddingLeft: Spacings.s2,
					flexWrap: 'nowrap',
					padding: Spacings.s1 / 2,
				},
			]}
			{...props}
		>
			<ChipLike>
				{DAY_NAMES_SHORT[lesson.start(studentSettings).getDayFromMonday()]}
			</ChipLike>
			<LessonTimeChip lesson={lesson}></LessonTimeChip>
			<Text style={Theme.fonts.titleSmall}>{getSubjectName(lesson)}</Text>
		</TouchableOpacity>
	)
})

// eslint-disable-next-line mobx/missing-observer
export const RenderDiaryLessonDraggable: ListRenderItem<Lesson> = args => (
	<DiaryLessonDraggable {...args} />
)

export function sortByDate(
	lessons: Lesson[],
	studentSettings: StudentSettings,
	realTime = false,
) {
	return lessons.sort((a, b) => {
		const aDate = realTime ? a.startDate : a.start(studentSettings)
		const bDate = realTime ? b.startDate : b.start(studentSettings)
		return aDate.getTime() - bDate.getTime()
	})
}
