import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { ProgressBar, Text } from 'react-native-paper'
import { Theme } from '~models/theme'
import { Lesson, LessonState } from '~services/net-school/entities'
import { Spacings } from '../../utils/Spacings'

export const LessonProgressStore = new (class {
	now = Date.now()
	currentLesson = 0
	constructor() {
		makeAutoObservable(this)
		setInterval(() => runInAction(() => (this.now = Date.now())), 1000)
	}
})()
const store = LessonProgressStore

export default observer(function LessonProgress(props: { lesson: Lesson }) {
	const { total, beforeStart, beforeEnd, progress, state, remaining } = useMemo(
		() => Lesson.status(props.lesson),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[props.lesson, store.now],
	)

	useEffect(() => {
		if (state === LessonState.going)
			runInAction(() => (store.currentLesson = props.lesson.classmeetingId))
		else if (store.currentLesson === props.lesson.classmeetingId) {
			runInAction(() => (store.currentLesson = 0))
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
							height: 10,
							borderRadius: Theme.roundness,
						}}
						progress={progress / 100}
					/>
				</View>
				<Text>
					{beforeEnd}/{total + 1}
				</Text>
				<Text>{remaining}</Text>
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
		gap: Spacings.s2,
	},
	progressView: {
		flex: 4,
		justifyContent: 'center',
	},
})