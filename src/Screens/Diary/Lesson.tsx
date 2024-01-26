import { observer } from 'mobx-react-lite'
import { Colors, Text, View } from 'react-native-ui-lib'
import { IconButton } from '../../Components/Button'
import { SubjectName } from '../../Components/SubjectName'
import { Diary, Lesson } from '../../NetSchool/classes'
import { AssignmentsStore } from '../../Stores/API.stores'
import { Theme } from '../../Stores/Theme.store'
import { DiaryAssignment } from './Assignment'
import { LessonProgress, LessonProgressStore } from './Progress'
import { DiaryStateStore } from './StateStore'

export const DiaryLesson = observer(function DiaryLesson({
	lesson,
}: {
	lesson: Diary['lessons'][number]
}) {
	const { showHomework } = DiaryStateStore
	return (
		<View
			margin-s2
			br20
			backgroundColor={Theme.theme.dark ? 'white' : 'black'}
			// Display white frame only when lesson is going
			padding-s2={LessonProgressStore.currentLesson === lesson.classmeetingId}
		>
			<View
				bg-$backgroundAccent
				br20
				style={{
					alignItems: 'flex-start',

					elevation: 15,
					minWidth: 280,
				}}
			>
				<TopRow lesson={lesson} />
				<MiddleRow lesson={lesson} />
				<LessonProgress lesson={lesson} />
				{showHomework && <DiaryAssignmentList lesson={lesson} />}
			</View>
		</View>
	)
})
const DiaryAssignmentList = observer(function DiaryAssignmentList({
	lesson,
}: {
	lesson: Lesson
}) {
	const assignments = AssignmentsStore
	if (assignments.fallback) return assignments.fallback

	const results = assignments.result.filter(
		e =>
			e.classmeetingId === lesson.classmeetingId ||
			(!e.weight &&
				new Date(e.assignmentDate).toYYYYMMDD() === lesson.start.toYYYYMMDD())
	)

	if (results.length) {
		return results.map(e => (
			<DiaryAssignment assignment={e} key={e.assignmentId} />
		))
	}
})
const TopRow = observer(function TopRow({ lesson }: { lesson: Lesson }) {
	return (
		<View
			row
			spread
			centerV
			padding-s3
			backgroundColor={Colors.$backgroundPrimaryMedium}
			br20
			style={{
				width: '100%',
				elevation: 10,
			}}
		>
			<SubjectName
				iconsSize={24}
				style={{
					fontWeight: 'bold',
					fontSize: 18,
					color: Colors.$textDefault,
				}}
				viewStyle={{
					maxWidth: '70%',
				}}
				subjectId={lesson.subjectId}
				subjectName={lesson.subjectName}
			/>

			<View row spread centerV>
				<Text
					marginT-0
					style={{
						fontWeight: 'bold',
						fontSize: 18,
						color: Colors.$textDefault,
					}}
				>
					{lesson.roomName ?? '?'}
				</Text>
				<IconButton
					iconColor={Colors.$textDefault}
					icon="pencil"
					size={25}
					marginL-s1
				/>
			</View>
		</View>
	)
})
const MiddleRow = observer(function MiddleRow({ lesson }: { lesson: Lesson }) {
	return (
		<View
			marginV-s1
			marginH-s3
			style={{
				width: '98%',
			}}
		>
			<Text text50 color={Colors.rgba(Colors.$textAccent, 0.7)}>
				{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
			</Text>

			<Text color={Colors.rgba(Colors.$textAccent, 0.7)}>
				{lesson.lessonTheme ?? 'Тема урока не указана'}
			</Text>

			{lesson.attachmentsExists && (
				<Text color={Colors.rgba(Colors.$textAccent, 0.5)} marginV-s2>
					Есть прикрепленные файлы
				</Text>
			)}
		</View>
	)
})
