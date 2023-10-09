import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { Async } from '../components/async'
import { LANG, STYLES } from '../constants'

export const HomeworkScreen = ({ studentId }: { studentId: number }) => {
	return (
		<ScrollView
			contentContainerStyle={{
				justifyContent: 'center',
				alignContent: 'center',
			}}
		>
			<Async
				promise={() => API.assignmentForCurrentTerm({ studentId })}
				deps={[API.changes, studentId]}
				loading="Загрузка дз{dots}"
				then={homework =>
					homework.map(lesson => (
						<View
							style={STYLES.schedule_item}
							id={lesson.subjectId + lesson.subjectName + Date.now()}
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
					))
				}
			/>
		</ScrollView>
	)
}
