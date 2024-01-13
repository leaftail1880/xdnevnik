import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { Colors, ProgressBar, Text, View } from 'react-native-ui-lib'
import { Lesson, LessonState } from '../../NetSchool/classes'

export const LessonProgress = observer(function LessonProgress({
	lesson,
}: {
	lesson: Lesson
}) {
	const [now, setNow] = useState(Date.now())
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000 * 3)

		return () => clearInterval(interval)
	}, [])

	const { total, beforeStart, beforeEnd, progress, state } = lesson.minutes(now)

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
