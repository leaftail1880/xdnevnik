import { useContext } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { Loading } from '../components/loading'
import { INVISIBLE_COLOR, LANG, styles } from '../constants'
import { useAPI } from '../hooks/api'
import { APP_CTX } from '../hooks/settings'

export function HomeworkScreen() {
	const { studentId } = useContext(APP_CTX)
	const { result: homework, fallback: HomeworkFallback } = useAPI(
		API,
		'homework',
		{ studentId },
		'дз'
	)

	if (!studentId) return <Loading text="Загрузка номера ученика{dots}" />

	return (
		HomeworkFallback || (
			<ScrollView
				contentContainerStyle={{
					justifyContent: 'center',
					alignContent: 'center',
					backgroundColor: INVISIBLE_COLOR,
				}}
			>
				{homework
					.sort(
						(a, b) =>
							new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
					)
					.map(lesson => (
						<View
							style={[styles.button, { alignItems: 'flex-start', margin: 7 }]}
							key={lesson.subjectId + lesson.subjectName + lesson.dueDate}
						>
							<Text style={{ fontWeight: 'bold', ...styles.buttonText }}>
								{lesson.subjectName + '\n'}
							</Text>
							<Text style={{ fontWeight: 'bold', ...styles.buttonText }}>
								{LANG.days[new Date(lesson.dueDate).getDayMon()]}
								{', '}
								{new Date(lesson.dueDate).getDay()}.
								{new Date(lesson.dueDate).getMonth()}
								{', '}
								{new Date(lesson.dueDate).toHHMM()}
								{'\n'}
							</Text>
							<Text style={styles.buttonText}>{lesson.assignmentName}</Text>
						</View>
					))}
			</ScrollView>
		)
	)
}
