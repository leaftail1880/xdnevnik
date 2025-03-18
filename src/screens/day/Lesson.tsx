import { Theme } from '@/models/theme'
import { AssignmentsStore } from '@/services/net-school/store'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Card, Chip, Text } from 'react-native-paper'
import { Spacings } from '../../utils/Spacings'
import { DiaryState } from './state'

import SubjectName from '@/components/SubjectName'
import { TermNavigationParamMap } from '@/screens/totals/navigation'
import { TermStore } from '@/screens/totals/term/state'
import { useCallback } from 'react'
import { LANG, styles } from '../../constants'
import DiaryAssignment from './Assignment'
import LessonProgress, { LessonProgressStore } from './Progress'
import { DiaryLessonNavigation, DiaryLessonProps } from './screen'
import { ScrollTextCopyable } from '@/components/ScrollTextCopyable'

export default observer(function DiaryLesson({
	lesson,
	navigation,
	i,
	...props
}: Omit<DiaryLessonProps, 'navigateToLessonMarks'> & DiaryLessonNavigation) {
	const currentTerm = TermStore.currentTerm
	const navigateToLessonMarks = useCallback(async () => {
		if (!currentTerm) return

		navigation.navigate(LANG['s_totals'])

		await new Promise<void>(r => setTimeout(r, 100))

		// @ts-expect-error Huh
		navigation.navigate(LANG['s_totals'], {
			screen: LANG['s_subject_totals'],
			params: {
				subjectId: lesson.subjectId,
				termId: currentTerm.id,
				finalMark: null,
			} satisfies TermNavigationParamMap[(typeof LANG)['s_subject_totals']],
		})
	}, [currentTerm, lesson, navigation])

	const newProps: DiaryLessonProps = {
		i,
		lesson,
		navigateToLessonMarks,
		...props,
	}

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
				flex: 1,
				gap: Spacings.s2,
			}}
		>
			<TopRow {...newProps} />
			<MiddleRow {...newProps} />
			{DiaryState.showHomework && <Assignments {...newProps} />}
			<LessonProgress lesson={lesson} />
		</Card>
	)
})

const TopRow = observer(function TopRow({ lesson, i }: DiaryLessonProps) {
	return (
		<>
			<View style={[styles.row, { alignItems: 'center' }]}>
				<View
					style={{
						backgroundColor: Theme.colors.secondaryContainer,
						borderRadius: Theme.roundness,
						padding: Spacings.s1,
						marginBottom: Spacings.s2,
						marginRight: Spacings.s1,
					}}
				>
					<Text
						style={{
							color: Theme.colors.onSecondaryContainer,
							fontWeight: 'bold',
						}}
					>
						{i + 1}
					</Text>
				</View>
				<SubjectName {...lesson} style={Theme.fonts.titleMedium} />
			</View>
			<View style={[styles.row, { gap: Spacings.s1 }]}>
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
				<ScrollTextCopyable>
					{lesson.lessonTheme ?? 'Темы нет'}
				</ScrollTextCopyable>
			)}

			{DiaryState.showAttachments && lesson.attachmentsExists && (
				<Text>Есть прикрепленные файлы</Text>
			)}
		</>
	)
})

const Assignments = observer(function Assignments(props: DiaryLessonProps) {
	if (AssignmentsStore.fallback) return AssignmentsStore.fallback

	const results = AssignmentsStore.result.filter(e => {
		const sameLesson = e.classmeetingId === props.lesson.classmeetingId
		// const sameDay =
		// !e.weight &&
		// new Date(e.assignmentDate).toYYYYMMDD() ===
		// props.lesson.start.toYYYYMMDD()

		return sameLesson // || sameDay
	})

	if (results.length) {
		return results.map(e => (
			<DiaryAssignment key={e.assignmentId} assignment={e} {...props} />
		))
	}
})
