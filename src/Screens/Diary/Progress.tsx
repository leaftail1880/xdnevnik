import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { View } from 'react-native'
import { ProgressBar, Text } from 'react-native-paper'
import { Spacings } from '../../Components/Spacings'
import { Lesson, LessonState } from '../../NetSchool/classes'
import { Theme } from '../../Stores/Theme'

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
		if (state === LessonState.going)
			runInAction(
				() => (LessonProgressStore.currentLesson = lesson.classmeetingId)
			)
		else if (LessonProgressStore.currentLesson === lesson.classmeetingId) {
			runInAction(() => (LessonProgressStore.currentLesson = 0))
		}
	}, [state, lesson.classmeetingId])

	const textStyle = {
		marginBottom: Spacings.s2,
		color: Theme.colors.onSurfaceDisabled,
	}

	if (state === LessonState.notStarted) {
		// Do not show time above 15 mins
		if (beforeStart < 15) {
			return <Text style={textStyle}>Начнется через {beforeStart} мин</Text>
		}
	} else if (state === LessonState.going) {
		return (
			<View
				style={{
					flexDirection: 'row',
					alignSelf: 'center',
					marginHorizontal: Spacings.s3,
					paddingHorizontal: Spacings.s2,
					marginBottom: Spacings.s2,
					alignContent: 'center',
				}}
			>
				<View
					style={{
						width: '80%',
					}}
				>
					<ProgressBar
						style={{
							width: '100%',
							height: 20,
						}}
						progress={progress}
					/>
				</View>
				<Text style={{ margin: Spacings.s1 }}>
					{beforeEnd}/{total} мин
				</Text>
			</View>
		)
	} else {
		// Lesson is ended
		return <Text style={textStyle}>Закончился</Text>
	}
})
