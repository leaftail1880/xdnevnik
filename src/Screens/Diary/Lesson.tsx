import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Card, Text } from 'react-native-paper'
import { Spacings } from '../../Components/Spacings'
import { SubjectName } from '../../Components/SubjectName'
import { Diary, Lesson } from '../../NetSchool/classes'
import { styles } from '../../Setup/constants'
import { AssignmentsStore } from '../../Stores/API'
import { Theme } from '../../Stores/Theme'
import { DiaryAssignment } from './Assignment'
import { LessonProgress, LessonProgressStore } from './Progress'
import { DiaryState } from './StateStore'

export const DiaryLesson = observer(function DiaryLesson({
	lesson,
}: {
	lesson: Diary['lessons'][number]
}) {
	const { showHomework } = DiaryState
	return (
		<Card
			style={{
				margin: Spacings.s1,
				padding: 0,
				borderCurve: 'continuous',

				// Display border frame only when lesson is going
				borderWidth:
					LessonProgressStore.currentLesson === lesson.classmeetingId ? 5 : 0,
				borderColor: Theme.colors.primary,
			}}
		>
			<TopRow lesson={lesson} />
			<MiddleRow lesson={lesson} />
			{showHomework && <DiaryAssignmentList lesson={lesson} />}
		</Card>
	)
})

const DiaryAssignmentList = observer(function DiaryAssignmentList({
	lesson,
}: {
	lesson: Lesson
}) {
	if (AssignmentsStore.fallback) return AssignmentsStore.fallback

	const results = AssignmentsStore.result.filter(e => {
		const sameLesson = e.classmeetingId === lesson.classmeetingId
		const sameTime =
			!e.weight &&
			new Date(e.assignmentDate).toYYYYMMDD() === lesson.start.toYYYYMMDD()

		return sameLesson || sameTime
	})

	if (results.length) {
		return results.map(e => (
			<DiaryAssignment assignment={e} key={e.assignmentId} />
		))
	}
})
const TopRow = observer(function TopRow({ lesson }: { lesson: Lesson }) {
	return (
		<View style={{}}>
			<View
				style={[
					styles.stretch,
					{
						elevation: 5,
						padding: Spacings.s1,
						paddingHorizontal: Spacings.s3,
						borderRadius: Theme.roundness * 2,
						backgroundColor: Theme.colors.secondaryContainer,
						width: '100%',
						margin: 0,
						marginBottom: Spacings.s1,
					},
				]}
			>
				<SubjectName
					style={Theme.theme.fonts.titleMedium}
					// eslint-disable-next-line react-native/no-color-literals
					textInputStyle={{ backgroundColor: '#00000000' }}
					viewStyle={{
						maxWidth: '70%',
					}}
					subjectId={lesson.subjectId}
					subjectName={lesson.subjectName}
				/>
				<Text variant="titleMedium">{lesson.roomName ?? '?'}</Text>
			</View>
			<View style={{ margin: 0, padding: Spacings.s2 }}>
				<Text variant="labelLarge">
					{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
				</Text>
			</View>
		</View>
	)
})
const MiddleRow = observer(function MiddleRow({ lesson }: { lesson: Lesson }) {
	return (
		<View style={{ paddingHorizontal: Spacings.s2 }}>
			{DiaryState.showLessonTheme && (
				<Text style={{ marginBottom: Spacings.s2 }}>
					{lesson.lessonTheme ?? 'Тема урока не указана'}
				</Text>
			)}

			<LessonProgress lesson={lesson} />

			{DiaryState.showAttachments && lesson.attachmentsExists && (
				<Text>Есть прикрепленные файлы</Text>
			)}
		</View>
	)
})
