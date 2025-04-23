import { Theme } from '@/models/theme'
import { AssignmentsStore } from '@/services/net-school/store'
import { observer } from 'mobx-react-lite'
import { StyleSheet, View } from 'react-native'
import { Card, Chip, Text } from 'react-native-paper'
import { Spacings } from '../../utils/Spacings'
import { DiaryState } from './state'

import { ChipLike } from '@/components/ChipLike'
import { ScrollTextCopyable } from '@/components/ScrollTextCopyable'
import SubjectName from '@/components/SubjectName'
import { XSettings } from '@/models/settings'
import { TermNavigationParamMap } from '@/screens/totals/navigation'
import { TermStore } from '@/screens/totals/term/state'
import { Lesson } from '@/services/net-school/lesson'
import { ModalAlert } from '@/utils/Toast'
import { useStyles } from '@/utils/useStyles'
import { useCallback, useMemo } from 'react'
import { LANG, globalStyles } from '../../constants'
import DiaryAssignment from './Assignment'
import { EditSingleLesson } from './edit/EditSingleLesson'
import LessonProgress, { LessonProgressStore } from './Progress'
import { DiaryLessonNavigation, DiaryLessonProps } from './screen'

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

	const newProps: DiaryLessonProps = useMemo(
		() => ({
			i,
			lesson,
			navigateToLessonMarks,
			...props,
		}),
		[props, i, lesson, navigateToLessonMarks],
	)

	const onLongPress = useCallback(
		() =>
			ModalAlert.show('Редактировать', <EditSingleLesson lesson={lesson} />),
		[lesson],
	)

	const cardStyle = useStyles(
		() => ({
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
		}),
		[LessonProgressStore.currentLesson],
	)

	return (
		<Card
			style={cardStyle}
			onLongPress={!lesson.isCustom ? onLongPress : undefined}
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
		<View style={{ gap: Spacings.s1 }}>
			<Name lesson={lesson} i={i}></Name>
			<View style={[globalStyles.row, { gap: Spacings.s1 }]}>
				<LessonTimeChip lesson={lesson} />
				<Chip compact>{lesson.roomName ?? '?'}</Chip>
			</View>
		</View>
	)
})

const Name = observer(function Name({
	lesson,
	i,
}: Pick<DiaryLessonProps, 'lesson' | 'i'>) {
	return (
		<View style={styles.name}>
			<ChipLike>{i + 1}</ChipLike>
			<SubjectName
				editDisabled={lesson.isCustom}
				style={Theme.fonts.titleMedium}
				subjectId={lesson.subjectId}
				subjectName={lesson.subjectName}
				dayNameId={lesson.dayNameId}
			/>
		</View>
	)
})

const styles = StyleSheet.create({
	name: {
		gap: Spacings.s1,
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
	},
})

export const LessonTimeChip = observer(function Time({
	lesson,
}: {
	lesson: Lesson
}) {
	const studentSettings = XSettings.forStudentOrThrow()
	return (
		<Chip compact>
			{lesson.start(studentSettings).toHHMM()} -{' '}
			{lesson.end(studentSettings).toHHMM()}
		</Chip>
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
		// const sameDay = !e.weight && new Date(e.assignmentDate).toYYYYMMDD() === props.lesson.start.toYYYYMMDD()
		return sameLesson // || sameDay
	})

	if (results.length) {
		return results.map(e => (
			<DiaryAssignment key={e.assignmentId} assignment={e} {...props} />
		))
	}
})
