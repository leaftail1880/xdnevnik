import { observer } from 'mobx-react-lite'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { DiaryStore } from '../../services/NetSchool/store'
import { Spacings } from '../../utils/Spacings'
import DiaryLesson from './Lesson'
import { DiaryState } from './state'
import { DiaryLessonProps } from './screen'

export default observer(function DiaryDay(
	props: Pick<DiaryLessonProps, 'navigation' | 'route'>,
) {
	if (DiaryStore.fallback) return DiaryStore.fallback

	const day = DiaryStore.result.forDay(DiaryState.day)
	if (day.length === 0) {
		return <Text style={styles.text}>Уроков нет, гуляем!</Text>
	}

	return day
		.sort((a, b) => a.order - b.order)
		.map(lesson => (
			<DiaryLesson
				key={lesson.classmeetingId.toString()}
				lesson={lesson}
				{...props}
			/>
		))
})

const styles = StyleSheet.create({
	text: { textAlign: 'center', margin: Spacings.s4 },
})
