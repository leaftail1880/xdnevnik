import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { Loading } from '../components/loading'
import { INVISIBLE_COLOR, LANG, styles } from '../constants'
import { useAPI } from '../hooks/async'

export function HomeworkScreen(props: { ctx: { studentId?: number } }) {
	const { studentId } = props.ctx
	const { result: homework, fallback: HomeworkFallback } = useAPI(
		API,
		'homework',
		{ studentId },
		'дз'
	)

	if (!API.authorized) return <Loading text="Ожидание авторизации{dots}" />
	if (!studentId)
		return <Loading text="Ожидание идентификатора ученика{dots}" />

	return (
		HomeworkFallback || (
			<ScrollView
				contentContainerStyle={{
					justifyContent: 'center',
					alignContent: 'center',
					backgroundColor: INVISIBLE_COLOR,
				}}
			>
				{homework.map(lesson => (
					<View
						style={styles.button}
						key={lesson.subjectId + lesson.subjectName + lesson.dueDate}
					>
						<Text style={{ fontWeight: 'bold', ...styles.buttonText }}>
							{lesson.subjectName + '\n'}
						</Text>
						<Text style={{ fontWeight: 'bold', ...styles.buttonText }}>
							{LANG.days[new Date(lesson.dueDate).getDayMon()] + '\n'}
						</Text>
						<Text style={styles.buttonText}>{lesson.assignmentName}</Text>
					</View>
				))}
			</ScrollView>
		)
	)
}
