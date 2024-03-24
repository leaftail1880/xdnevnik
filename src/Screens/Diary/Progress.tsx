import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { ProgressBar, Text } from 'react-native-paper'
import { Lesson, LessonState } from '../../NetSchool/classes'
import { Theme } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'

export const LessonProgressStore = new (class {
	now = Date.now()
	currentLesson = 0
	constructor() {
		makeAutoObservable(this)
		setInterval(() => runInAction(() => (this.now = Date.now())), 1000 * 3)
	}
})()

export default observer(function LessonProgress(props: { lesson: Lesson }) {
	const { total, beforeStart, beforeEnd, progress, state } = useMemo(
		() => props.lesson.minutes(LessonProgressStore.now),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[props.lesson, LessonProgressStore.now]
	)

	useEffect(() => {
		if (state === LessonState.going)
			runInAction(
				() => (LessonProgressStore.currentLesson = props.lesson.classmeetingId)
			)
		else if (
			LessonProgressStore.currentLesson === props.lesson.classmeetingId
		) {
			runInAction(() => (LessonProgressStore.currentLesson = 0))
		}
	}, [state, props.lesson.classmeetingId])

	const textStyle = {
		color: Theme.colors.onSurfaceDisabled,
	}

	if (state === LessonState.notStarted) {
		// Do not show time above 15 mins
		if (beforeStart < 15) {
			return <Text style={textStyle}>Начнется через {beforeStart} мин</Text>
		}
	} else if (state === LessonState.going) {
		return (
			<View style={styles.row}>
				<View style={styles.progressView}>
					<ProgressBar
						style={{
							height: 15,
							borderRadius: Theme.roundness / 2,
						}}
						progress={progress / 100}
					/>
				</View>
				<Text style={styles.progressText}>
					{beforeEnd}/{total} мин
				</Text>
			</View>
		)
	} else {
		// Lesson is ended
		return <Text style={textStyle}>Закончился</Text>
	}
})

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
	},
	progressView: {
		flex: 5,
		justifyContent: 'center',
	},
	progressText: {
		marginLeft: Spacings.s2,
	},
})