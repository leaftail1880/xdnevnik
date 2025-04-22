import { Settings } from '@/models/settings'
import { DiaryStore } from '@/services/net-school/store'
import { observer } from 'mobx-react-lite'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { Spacings } from '../../utils/Spacings'
import { sortByDate } from './edit/ReorderLessons'
import DiaryLesson from './Lesson'
import { DiaryLessonNavigation } from './screen'
import { DiaryState } from './state'

export default observer(function DiaryDay(props: DiaryLessonNavigation) {
	if (DiaryStore.fallback) return DiaryStore.fallback

	const studentSettings = Settings.forStudentOrThrow()
	const dayLessons = sortByDate(
		DiaryStore.result.forDay(DiaryState.day, studentSettings),
		studentSettings,
	)

	if (dayLessons.length === 0) {
		return <Text style={styles.text}>Занятий нет, свобода!</Text>
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

const styles = StyleSheet.create({
	text: { textAlign: 'center', margin: Spacings.s4 },
	reordableList: {
		paddingHorizontal: Spacings.s1,
	},
	padding: { padding: Spacings.s2 },
})
