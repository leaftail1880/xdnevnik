import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Card, Text } from 'react-native-paper'
import { SubjectName } from '../../Components/SubjectName'
import { Lesson } from '../../NetSchool/classes'
import { styles } from '../../Setup/constants'
import { AssignmentsStore } from '../../Stores/NetSchool'
import { Theme } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'
import { DiaryAssignment } from './Assignment'
import { LessonProgress, LessonProgressStore } from './Progress'
import { DiaryState } from './StateStore'
import { StackScreenProps } from '@react-navigation/stack'
import { ParamListBase } from '../../../App'

export type DiaryLessonProps = {
	lesson: Lesson
} & StackScreenProps<ParamListBase>

export default observer(function DiaryLesson({
	lesson,
	...props
}: DiaryLessonProps) {
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
			<TopRow lesson={lesson} {...props} />
			<MiddleRow lesson={lesson} {...props} />
			{DiaryState.showHomework && <Assignments lesson={lesson} {...props} />}
		</Card>
	)
})

const TopRow = observer(function TopRow({ lesson }: DiaryLessonProps) {
	return (
		<View>
			<View
				style={[
					styles.stretch,
					{
						paddingHorizontal: Spacings.s3,
						marginBottom: Spacings.s1,
						margin: 0,

						justifyContent: 'space-between',

						elevation: 3,
						borderRadius: Theme.roundness * 2,
						backgroundColor: Theme.colors.secondaryContainer,
					},
				]}
			>
				<SubjectName
					style={Theme.theme.fonts.titleMedium}
					viewStyle={{
						maxWidth: '70%',
					}}
					subjectId={lesson.subjectId}
					subjectName={lesson.subjectName}
				/>
				<Text variant="titleMedium">{lesson.roomName ?? '?'}</Text>
			</View>
		</View>
	)
})

const MiddleRow = observer(function MiddleRow({ lesson }: DiaryLessonProps) {
	return (
		<View style={{ padding: Spacings.s2 }}>
			<Text variant="labelLarge">
				{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
			</Text>

			{DiaryState.showLessonTheme && (
				<Text style={{ marginBottom: Spacings.s2 }}>
					{lesson.lessonTheme ?? 'Тема урока не указана'}
				</Text>
			)}

			<LessonProgress lesson={lesson} />

			<View style={{ padding: Spacings.s2 }}>
				{DiaryState.showAttachments && lesson.attachmentsExists && (
					<Text>Есть прикрепленные файлы</Text>
				)}
			</View>
		</View>
	)
})

const Assignments = observer(function DiaryAssignmentList({
	lesson,
	navigation,
}: DiaryLessonProps) {
	if (AssignmentsStore.fallback) return AssignmentsStore.fallback

	const results = AssignmentsStore.result.filter(e => {
		const sameLesson = e.classmeetingId === lesson.classmeetingId
		const sameDay =
			!e.weight &&
			new Date(e.assignmentDate).toYYYYMMDD() === lesson.start.toYYYYMMDD()

		return sameLesson || sameDay
	})

	if (results.length) {
		return results.map(e => (
			<DiaryAssignment
				assignment={e}
				key={e.assignmentId}
				navigation={navigation}
				lesson={lesson}
			/>
		))
	}
})
