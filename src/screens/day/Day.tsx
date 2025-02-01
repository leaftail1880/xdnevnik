import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import ReorderableList, {
	ReorderableListReorderEvent,
	reorderItems,
} from 'react-native-reorderable-list'
import { Settings, StudentSettings } from '~models/settings'
import type { Lesson } from '~services/net-school/lesson'
import { DiaryStore } from '~services/net-school/store'
import { Spacings } from '../../utils/Spacings'
import DiaryLesson, { RenderDiaryLessonDraggable } from './Lesson'
import { DiaryLessonNavigation } from './screen'
import { DiaryState } from './state'

function sortByDate(
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

export default observer(function DiaryDay(props: DiaryLessonNavigation) {
	if (DiaryStore.fallback) return DiaryStore.fallback

	const studentSettings = Settings.forStudentOrThrow()
	const dayLessons = sortByDate(
		DiaryStore.result.forDay(DiaryState.day, studentSettings),
		studentSettings,
	)

	if (dayLessons.length === 0) {
		return <Text style={styles.text}>Уроков нет, гуляем!</Text>
	}

	return dayLessons.map((lesson, i) => (
		<DiaryLesson
			i={i}
			key={lesson.classmeetingId.toString()}
			lesson={lesson}
			{...props}
		/>
	))
})

const editDayState = new (class {
	constructor() {
		makeAutoObservable(this, {}, { autoBind: true })
	}

	key = 0
	lessons: Lesson[] = []

	reset() {
		const studentSettings = Settings.forStudentOrThrow()
		studentSettings.lessonOrder = {}

		this.key++
		this.lessons = []
	}
})()

export const DiaryEditDay = observer(function DiaryEditDay({lessons}: {lessons: Lesson[]}) {
	const studentSettings = Settings.forStudentOrThrow()
	const lessonsSorted =
		editDayState.lessons.length === 0
			? sortByDate(lessons.slice(), studentSettings)
			: editDayState.lessons

	const onReorder = useCallback(
		(args: ReorderableListReorderEvent) => {
			runInAction(
				() =>
					(editDayState.lessons = reorderItems(
						lessonsSorted,
						args.from,
						args.to,
					)),
			)
		},
		[lessonsSorted],
	)

	return (
		<View>
			<Text>{JSON.stringify(studentSettings.lessonOrder)}</Text>
			<Button onPress={editDayState.reset}>Сбросить</Button>
			<Button onPress={onSave}>Сохранить</Button>
			<ReorderableList
				data={lessonsSorted}
				keyExtractor={keyExtractor}
				renderItem={RenderDiaryLessonDraggable}
				onReorder={onReorder}
				key={editDayState.key.toString()}
			/>
		</View>
	)
})

const onSave = () => {
	runInAction(() => {
		if (!DiaryStore.result) return

		const studentSettings = Settings.forStudentOrThrow()
		studentSettings.lessonOrder = {}

		const realLessonsSorted = sortByDate(
			DiaryStore.result.lessons.slice(),
			studentSettings,
			true,
		)

		const lessonsSorted = editDayState.lessons

		for (const [fromIndex, lesson] of realLessonsSorted.entries()) {
			const toIndex = lessonsSorted.findIndex(l => l === lesson)
			const direction = fromIndex - toIndex < 0 ? 1 : -1
			debug({
				fromIndex,
				toIndex,
				direction,
			})

			try {
				for (let i = fromIndex; i < toIndex; i = i + direction) {
					const { to, offset, from } = getOffset(
						lessonsSorted,
						i,
						i + direction,
					)

					setOffset(to, offset, studentSettings)
					setOffset(from, -offset, studentSettings)
				}
			} catch (e) {
				debug('Failed')
			}
		}

		editDayState.lessons = []
	})
}

const styles = StyleSheet.create({
	text: { textAlign: 'center', margin: Spacings.s4 },
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

function setOffset(
	curr: Lesson,
	offset: number,
	studentSettings: StudentSettings,
) {
	let dayOrder = studentSettings.lessonOrder[curr.offsetId]
	if (!dayOrder) {
		studentSettings.lessonOrder[curr.offsetId] = {}
		dayOrder = studentSettings.lessonOrder[curr.offsetId]
	}

	if (!dayOrder) throw new TypeError('Day order is undefined!')

	dayOrder[curr.subjectId] = offset
	debug({ offset, s: curr.subjectId })
}
