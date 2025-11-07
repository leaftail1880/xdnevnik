import { XSettings } from '@/models/settings'
import { DiaryStore } from '@/services/net-school/store'
import { observer } from 'mobx-react-lite'
import { StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { XBottomTabScreenProps } from '../../../App'
import { Spacings } from '../../utils/Spacings'
import DiaryLesson from './Lesson'
import { DiaryState } from './state'

export default observer(function DiaryDay(props: XBottomTabScreenProps) {
	if (DiaryStore.fallback) return DiaryStore.fallback

	const studentSettings = XSettings.forStudentOrThrow()
	const dayLessons = DiaryStore.result.forDay(DiaryState.day, studentSettings)

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
