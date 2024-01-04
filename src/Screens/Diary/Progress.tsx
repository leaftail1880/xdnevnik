import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { Colors, ProgressBar, Text, View } from 'react-native-ui-lib'
import { Lesson } from '../../NetSchool/classes'

export const LessonProgress = observer(function LessonProgress({
	lesson,
}: {
	lesson: Lesson
}) {
	// const now = new Date(2023, 11, 12, 8, 30).getTime()
	const [now, setNow] = useState(Date.now())
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000 * 3)

		return () => clearInterval(interval)
	}, [])

	const start = lesson.start.getTime()
	const end = lesson.end.getTime()

	if (now < start) {
		// Not started yet
		const minsBeforeStart = ~~((start - now) / (1000 * 60))

		// Do not show time above 15 mins
		if (minsBeforeStart < 15) {
			return (
				<Text
					color={Colors.rgba(Colors.$textAccent, 0.5)}
					center
					marginH-s3
					marginB-s2
				>
					Начнется через {minsBeforeStart} мин
				</Text>
			)
		}
	} else if (now <= end) {
		// Lesson is going right now
		const minsBeforeEnd = ~~((now - start) / (1000 * 60))
		const minsTotal = ~~((end - start) / (1000 * 60))

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
						progress={100 - ~~(((end - now) * 100) / (end - start))}
						progressColor={Colors.$textAccent}
					/>
				</View>
				<Text $textAccent margin-s1>
					{minsBeforeEnd}/{minsTotal} мин
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
