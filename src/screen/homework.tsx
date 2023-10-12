import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { Loading } from '../components/loading'
import { INVISIBLE_COLOR, LANG, STYLES } from '../constants'
import { useAsync } from '../hooks/async'

export function HomeworkScreen(props: { ctx: { studentId?: number } }) {
	const { studentId } = props.ctx
	const [homework, HomeworkFallback] = useAsync(
		() => API.assignmentForCurrentTerm({ studentId: studentId! }),
		'дз',
		[API.changes, studentId]
	)

	if (!API.loggedIn) return <Loading text="Ожидание авторизации{dots}" />
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
						style={STYLES.scheduleItem}
						key={lesson.subjectId + lesson.subjectName + lesson.dueDate}
					>
						<Text style={{ fontWeight: 'bold', ...STYLES.buttonText }}>
							{lesson.subjectName + '\n'}
						</Text>
						<Text style={{ fontWeight: 'bold', ...STYLES.buttonText }}>
							{[
								LANG['monday'],
								LANG['tuesday'],
								LANG['wednesday'],
								LANG['thursday'],
								LANG['friday'],
								LANG['saturday'],
								LANG['sunday'],
							][new Date(lesson.dueDate).getDayMon()] + '\n'}
						</Text>
						<Text style={STYLES.buttonText}>{lesson.assignmentName}</Text>
					</View>
				))}
			</ScrollView>
		)
	)
}
