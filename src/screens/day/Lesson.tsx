import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Card, Chip, Text } from 'react-native-paper'
import { Theme } from '~models/theme'
import { AssignmentsStore } from '~services/net-school/store'
import { Spacings } from '../../utils/Spacings'
import { DiaryState } from './state'

import SubjectName from '~components/SubjectName'
import { styles } from '../../constants'
import DiaryAssignment from './Assignment'
import LessonProgress, { LessonProgressStore } from './Progress'
import { DiaryLessonProps } from './screen'

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
				padding: Spacings.s2,
			}}
		>
			<TopRow lesson={lesson} {...props} />
			<MiddleRow lesson={lesson} {...props} />
			{DiaryState.showHomework && <Assignments lesson={lesson} {...props} />}
			<LessonProgress lesson={lesson} />
		</Card>
	)
})

const TopRow = observer(function TopRow({ lesson }: DiaryLessonProps) {
	return (
		<>
			<SubjectName {...lesson} style={Theme.fonts.titleMedium} />
			<View
				style={[styles.row, { marginVertical: Spacings.s1, gap: Spacings.s1 }]}
			>
				<Chip compact>
					{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
				</Chip>
				<Chip compact>{lesson.roomName ?? '?'}</Chip>
			</View>
		</>
	)
})

const MiddleRow = observer(function MiddleRow({ lesson }: DiaryLessonProps) {
	return (
		<>
			{DiaryState.showLessonTheme && (
				<Text selectable>{lesson.lessonTheme ?? 'Темы нет'}</Text>
			)}

			{DiaryState.showAttachments && lesson.attachmentsExists && (
				<Text>Есть прикрепленные файлы</Text>
			)}
		</>
	)
})

const Assignments = observer(function Assignments({
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
