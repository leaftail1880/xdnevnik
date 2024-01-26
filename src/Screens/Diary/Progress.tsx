import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { Colors, ProgressBar, Text, View } from 'react-native-ui-lib'
import { Lesson, LessonState } from '../../NetSchool/classes'

export const LessonProgressStore = new (class {
	now = Date.now()
	currentLesson = 0
	constructor() {
		makeAutoObservable(this)
		setInterval(() => runInAction(() => (this.now = Date.now())), 1000 * 3)
	}
})()

export const LessonProgress = observer(function LessonProgress({
	lesson,
}: {
	lesson: Lesson
}) {
	const { total, beforeStart, beforeEnd, progress, state } = useMemo(
		() => lesson.minutes(LessonProgressStore.now),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[lesson, LessonProgressStore.now]
	)

	useEffect(() => {
		if (state === LessonState.ended)
			runInAction(
				() => (LessonProgressStore.currentLesson = lesson.classmeetingId)
			)
	}, [state, lesson.classmeetingId])

	if (state === LessonState.notStarted) {
		// Do not show time above 15 mins
		if (beforeStart < 15) {
			return (
				<Text
					color={Colors.rgba(Colors.$textAccent, 0.5)}
					center
					marginH-s3
					marginB-s2
				>
					Начнется через {beforeStart} мин
				</Text>
			)
		}
	} else if (state === LessonState.going) {
		return (
			<View row center marginH-s3 paddingH-s2 marginB-s2 centerV>
				<View
					style={{
						width: '80%',
					}}
				>
					<ProgressBar
						style={{
							width: '100%',
							height: 20,
							backgroundColor: Colors.rgba(Colors.black, 0.3),
						}}
						progress={progress}
						progressColor={Colors.$textAccent}
					/>
				</View>
				<Text $textAccent margin-s1>
					{beforeEnd}/{total} мин
				</Text>
			</View>
		)
	} else {
		// Lesson is ended
		return (
			<Text
				color={Colors.rgba(Colors.$textAccent, 0.5)}
				center
				marginH-s3
				marginB-s2
			>
				Закончился
			</Text>
		)
	}
})
