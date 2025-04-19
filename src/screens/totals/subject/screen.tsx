import { Chips } from '@/components/Chips'
import Mark from '@/components/Mark'
import { RoundedSurface } from '@/components/RoundedSurface'
import SubjectName from '@/components/SubjectName'
import UpdateDate from '@/components/UpdateDate'
import { LANG, styles } from '@/constants'
import { AsyncState } from '@/models/async.store'
import { Settings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { DiaryState } from '@/screens/day/state'
import type {
	Assignment,
	PartialAssignment,
	SubjectPerformance,
} from '@/services/net-school/entities'
import {
	MarkAssignmentsStore,
	SubjectPerformanceStores,
} from '@/services/net-school/store'
import {
	MarksNotificationStore,
	StudentMarksStorage,
} from '@/services/notifications/marks'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { calculateMarks } from '@/utils/calculateMarks'
import { StackScreenProps } from '@react-navigation/stack'
import { formatDistanceToNow, formatDuration } from 'date-fns'
import { ru } from 'date-fns/locale'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Chip, IconButton, Text } from 'react-native-paper'
import type { S_SUBJECT_TOTALS, TermNavigationParamMap } from '../navigation'
import { ToGetMarkChips } from '../term/ToGetMarkChip'
import { AddMarkForm } from './AddMarkForm'

type ScreenProps = StackScreenProps<
	TermNavigationParamMap,
	typeof S_SUBJECT_TOTALS
>

export default observer(function SubjectTotals({
	route,
	navigation,
}: ScreenProps) {
	const { studentId } = Settings
	const { subjectId, termId } = route.params
	const performance = SubjectPerformanceStores.use({
		studentId,
		subjectId,
	})
	performance.withParams({ termId })
	return (
		<SubjectTotalsImpl
			{...route.params}
			performance={performance}
			navigateToDiary={() => navigation.getParent()?.navigate(LANG.s_diary)}
		/>
	)
})

export const SubjectTotalsImpl = observer(function SubjectTotalsImpl({
	performance,
	navigateToDiary,
	finalMark,
}: {
	performance: AsyncState<SubjectPerformance>
	navigateToDiary: () => void
	finalMark: string | number | null
}) {
	const { studentId } = Settings
	const studentSettings = Settings.forStudentOrThrow()

	const [lessonsWithoutMark, setLessonsWithoutMark] = useState(false)
	const [attendance, setAttendance] = useState(false)
	const [customMarks, setCustomMarks] = useState<Partial<PartialAssignment>[]>(
		[],
	)
	const marks = useMemo(
		() =>
			!!performance.result &&
			calculateMarks({
				totals: performance.result,
				lessonsWithoutMark,
				customMarks,
				attendance: attendance,
				targetMark: studentSettings.targetMark,
				defaultMark: studentSettings.defaultMark,
				defaultMarkWeight: studentSettings.defaultMarkWeight,
				markRoundAdd: Settings.markRoundAdd,
			}),
		[
			attendance,
			customMarks,
			lessonsWithoutMark,
			performance.result,
			studentSettings,
		],
	)

	if (performance.fallback) return performance.fallback

	if (!marks) return <Text>Ошибка при подсчете оценок</Text>
	const { avgMark, totalsAndSheduledTotals, maxWeight, minWeight, toGetMarks } =
		marks

	MarkAssignmentsStore.withParams({
		classmeetingsIds: totalsAndSheduledTotals
			.map(e => e.classMeetingId)
			.filter(e => typeof e === 'number'),
		studentId,
	})

	return (
		<View style={{ flex: 1 }}>
			<View
				style={[
					styles.stretch,
					{
						flexWrap: 'wrap',
						padding: Spacings.s2,
						backgroundColor: Theme.colors.navigationBar,
						borderBottomLeftRadius: Theme.roundness,
						borderBottomRightRadius: Theme.roundness,
						elevation: 2,
					},
				]}
			>
				<SubjectName
					subjectName={performance.result.subject.name}
					subjectId={performance.result.subject.id}
					style={{
						fontSize: 18,
						fontWeight: 'bold',
						margin: Spacings.s1,
					}}
				/>
				<Mark
					duty={false}
					finalMark={finalMark}
					mark={avgMark}
					style={{ padding: Spacings.s2 }}
					textStyle={{ fontSize: 18 }}
				/>
			</View>
			<ScrollView
				refreshControl={performance.refreshControl}
				contentContainerStyle={{
					gap: Spacings.s2,
					paddingTop: Spacings.s2,
				}}
			>
				{(performance.result.classmeetingsStats.passed > 0 ||
					!!toGetMarks.length) && (
					<Chips style={{ marginRight: Spacings.s2, paddingVertical: 0 }}>
						<ToGetMarkChips toGetMarks={toGetMarks} />
						{performance.result.classmeetingsStats.passed !== 0 && (
							<>
								<Chip
									mode="flat"
									compact
									selected={attendance}
									onPress={() => {
										setAttendance(!attendance)
									}}
								>
									Посещаемость
								</Chip>
								<Chip
									mode="flat"
									compact
									selected={lessonsWithoutMark}
									onPress={() => {
										setLessonsWithoutMark(!lessonsWithoutMark)
									}}
								>
									Уроки без оценок
								</Chip>
							</>
						)}
					</Chips>
				)}
				{totalsAndSheduledTotals.map((e, i) => (
					<MarkRow
						mark={e}
						maxWeight={maxWeight}
						minWeight={minWeight}
						navigateToDiary={navigateToDiary}
						onDelete={() => setCustomMarks(v => v.filter(ee => ee !== e))}
						key={e.assignmentId ?? i.toString()}
					/>
				))}
				<RoundedSurface elevation={1}>
					<AddMarkForm
						setCustomMarks={setCustomMarks}
						customMarks={customMarks}
					/>
				</RoundedSurface>
				<RoundedSurface elevation={1}>
					{!!customMarks.length && (
						<Text>
							Возможных оценок:{' '}
							<Text variant="labelLarge">{customMarks.length}</Text>
						</Text>
					)}
					{!!performance.result.teachers.length && (
						<Text>
							Учитель:{' '}
							<Text variant="labelLarge">
								{performance.result.teachers
									.map(e => Settings.fullname(e.name))
									.join(', ')}
							</Text>
						</Text>
					)}
					{performance.result.classmeetingsStats.passed !== 0 && (
						<Text>
							Прошло уроков:{' '}
							<Text variant="labelLarge">
								{performance.result.classmeetingsStats.passed}/
								{performance.result.classmeetingsStats.scheduled}
							</Text>
							, осталось:{' '}
							<Text variant="labelLarge">
								{performance.result.classmeetingsStats.scheduled -
									performance.result.classmeetingsStats.passed}
							</Text>
						</Text>
					)}

					<Text>
						Всего оценок:{' '}
						<Text variant="labelLarge">
							{performance.result.results.length}
						</Text>
					</Text>

					<Text>
						Суммарный вес всех оценок:{' '}
						<Text variant="labelLarge">
							{performance.result.results.reduce((p, c) => p + c.weight, 0)}
						</Text>
					</Text>
					{performance.result.classmeetingsStats.passed !== 0 && (
						<View
							style={{
								flexDirection: 'row',
								marginVertical: Spacings.s1,
								flex: 1,
								alignItems: 'center',
							}}
						>
							<Text>Средний балл класса: </Text>
							<Mark
								mark={performance.result.classAverageMark}
								duty={false}
								style={{ padding: Spacings.s1 }}
							/>
						</View>
					)}
				</RoundedSurface>
				{!!performance.updateDate && <UpdateDate store={performance} />}
			</ScrollView>
		</View>
	)
})

const MarkSeenToggleLabel = observer(function MarkSeenToggleLabel({
	studentStore,
	id,
}: {
	studentStore: StudentMarksStorage
	id: string | number
}) {
	return studentStore.forceNotSeen.includes(id)
		? 'Отметить прочитанной'
		: 'Отметить непрочитанной'
})

const MarkRow = observer(function MarkRow({
	mark,
	maxWeight,
	minWeight,
	onDelete,
	navigateToDiary,
}: {
	mark: Partial<PartialAssignment>
	maxWeight: number
	minWeight: number
	onDelete: VoidFunction
	navigateToDiary: VoidFunction
}) {
	Theme.key
	const date = mark.classMeetingDate ?? mark.date
	const assignment = MarkAssignmentsStore.result?.find(
		e => e.assignmentId === mark.assignmentId,
	)
	const onPress = () => {
		if (!Settings.studentId) return

		const date = mark.classMeetingDate
			? new Date(mark.classMeetingDate)
			: undefined
		const now = new Date()
		date?.setHours(
			now.getHours(),
			now.getMinutes(),
			now.getSeconds(),
			now.getMilliseconds(),
		)

		const studentStore = MarksNotificationStore.getStudent(Settings.studentId)

		const title = `${mark.assignmentTypeName ?? ''} ${mark.result ?? 'Оценки нет'}`
		const id = mark.assignmentId
		ModalAlert.show(
			title,
			<MarkInfo mark={mark} assignment={assignment} date={date} />,
			false,
			id
				? [
						{
							label: 'Перейти ко дню',
							callback() {
								if (date) {
									DiaryState.day = date.toYYYYMMDD()
									navigateToDiary()
									ModalAlert.close()
								}
							},
						},
						{
							label: (
								<MarkSeenToggleLabel id={id} studentStore={studentStore} />
							),
							callback() {
								if (studentStore.forceNotSeen.includes(id)) {
									studentStore.forceNotSeen = studentStore.forceNotSeen.filter(
										e => e !== id,
									)
								} else {
									studentStore.forceNotSeen.push(id)
								}
							},
						},
					]
				: undefined,
		)
	}
	useEffect(() => {
		runInAction(() => {
			if (mark.assignmentId && Settings.studentId) {
				const studentStorage = MarksNotificationStore.getStudent(
					Settings.studentId,
				)
				studentStorage.seen.push(mark.assignmentId)
			}
		})
	}, [mark.assignmentId])
	return (
		<View
			style={[
				styles.stretch,
				{
					paddingHorizontal: Spacings.s2,
					gap: Spacings.s1,
				},
			]}
		>
			<Mark
				duty={mark.duty ?? false}
				mark={mark.result ?? null}
				weight={mark.weight}
				minWeight={minWeight}
				maxWeight={maxWeight}
				style={{
					paddingHorizontal: Spacings.s2 * 1.5,
					paddingVertical: 2,
					minWidth: 40,
				}}
				onPress={onPress}
				unseen={
					!!mark.assignmentId &&
					!!Settings.studentId &&
					MarksNotificationStore.isUnseen(Settings.studentId, mark.assignmentId)
				}
			/>
			<View
				style={{
					marginHorizontal: Spacings.s1,
					alignContent: 'center',
					flex: 4,
				}}
			>
				<Text>{mark.assignmentTypeName}</Text>
				<Text style={{ fontSize: 10 }}>{assignment?.assignmentName}</Text>
			</View>

			{mark.custom ? (
				<IconButton icon="delete" onPress={onDelete} />
			) : (
				<Text>{date && new Date(date).toLocaleDateString()}</Text>
			)}
		</View>
	)
})

const MarkInfo = observer(function MarkInfo({
	mark,
	assignment,
	date,
}: {
	mark: Partial<PartialAssignment>
	assignment?: Assignment
	date: Date | undefined
}) {
	const appearDate = mark.date ? new Date(mark.date) : undefined

	let appearDateDifferenceInDays = -1
	if (appearDate && date) {
		const dateDay = new Date(date)
		dateDay.setHours(
			appearDate.getHours(),
			appearDate.getMinutes(),
			appearDate.getSeconds(),
			appearDate.getMilliseconds(),
		)

		const day = 1000 * 60 * 60 * 24
		appearDateDifferenceInDays =
			(appearDate.getTime() - dateDay.getTime()) / day
	}
	return (
		<View style={{ gap: Spacings.s1 }}>
			{mark.weight ? (
				<Text>
					<Text style={{ fontWeight: 'bold' }}>Вес: </Text>
					{mark.weight}
				</Text>
			) : (
				<Text>Отсутствие</Text>
			)}
			{mark.comment && (
				<Text>
					<Text style={{ fontWeight: 'bold' }}>Комментарий: </Text>
					{mark.comment}
				</Text>
			)}
			{assignment?.assignmentName && (
				<Text>
					<Text style={{ fontWeight: 'bold' }}>Тема урока: </Text>
					{assignment.assignmentName}
				</Text>
			)}
			{date && (
				<>
					<Text>
						<Text style={{ fontWeight: 'bold' }}>Урок был: </Text>
						{date.toLocaleDateString()} ({LANG.days[date.getDayFromMonday()]},{' '}
						{formatDistanceToNow(date, { locale: ru, addSuffix: true })})
					</Text>
					{appearDate && (
						<Text>
							<Text style={{ fontWeight: 'bold' }}>Выставлена: </Text>
							{appearDate.toLocaleDateString()} {appearDate.toHHMM()} (
							{LANG.days[date.getDayFromMonday()]},{' '}
							{formatDistanceToNow(appearDate, {
								locale: ru,
								addSuffix: true,
							})}
							,{' '}
							{appearDateDifferenceInDays === -1 ? (
								''
							) : appearDateDifferenceInDays === 0 ? (
								<Text style={{ fontWeight: 'bold' }}>в тот же день</Text>
							) : (
								<Text>
									за{' '}
									{formatDuration(
										{ days: appearDateDifferenceInDays },
										{ locale: ru },
									)}
								</Text>
							)}
							)
						</Text>
					)}
				</>
			)}
		</View>
	)
})
