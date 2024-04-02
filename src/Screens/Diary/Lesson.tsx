import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Card, Text } from 'react-native-paper'
import { ParamListBase } from '../../../App'
import { Lesson } from '../../NetSchool/classes'
import { styles } from '../../Setup/constants'
import { AssignmentsStore } from '../../Stores/NetSchool'
import { Theme } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'
import { DiaryState } from './State'

import SubjectName from '../../Components/SubjectName'
import DiaryAssignment from './Assignment'
import LessonProgress, { LessonProgressStore } from './Progress'

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
				borderCurve: 'continuous',

				// Display border frame only when lesson is going
				borderWidth:
					LessonProgressStore.currentLesson === lesson.classmeetingId
						? Spacings.s1
						: 0,

				borderColor: Theme.colors.primary,
			}}
		>
			<TopRow lesson={lesson} {...props} />
			<View style={{ padding: Spacings.s2 }}>
				<MiddleRow lesson={lesson} {...props} />
				{DiaryState.showHomework && <Assignments lesson={lesson} {...props} />}
			</View>
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
						paddingHorizontal: Spacings.s2,
						paddingVertical: Spacings.s1,
						justifyContent: 'space-between',

						elevation: 3,
						borderRadius: Theme.roundness * 2,
						backgroundColor: Theme.colors.secondaryContainer,
					},
				]}
			>
				<SubjectName
					style={Theme.fonts.titleMedium}
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
		<>
			<Text variant="labelLarge">
				{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
			</Text>

			{DiaryState.showLessonTheme && (
				<Text style={{ paddingBottom: Spacings.s1 }}>
					{lesson.lessonTheme ?? 'Темы нет'}
				</Text>
			)}

			<LessonProgress lesson={lesson} />

			{DiaryState.showAttachments && lesson.attachmentsExists && (
				<Text style={{ paddingBottom: Spacings.s1 }}>
					Есть прикрепленные файлы
				</Text>
			)}
		</>
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
		return (
			<View style={{ padding: 0, margin: 0 }}>
				{results.map(e => (
					<DiaryAssignment
						assignment={e}
						key={e.assignmentId}
						navigation={navigation}
						lesson={lesson}
					/>
				))}
			</View>
		)
	}
})
