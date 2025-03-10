import { StackScreenProps } from '@react-navigation/stack'
import { formatDistanceToNow, formatDuration } from 'date-fns'
import { ru } from 'date-fns/locale'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Button, Chip, IconButton, Text } from 'react-native-paper'
import Mark from '~components/Mark'
import { RoundedSurface } from '~components/RoundedSurface'
import SubjectName from '~components/SubjectName'
import UpdateDate from '~components/UpdateDate'
import { LANG, styles } from '~constants'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { DiaryState } from '~screens/day/state'
import type {
	Assignment,
	PartialAssignment,
} from '~services/net-school/entities'
import {
	MarkAssignmentsStore,
	SubjectPerformanceStores,
} from '~services/net-school/store'
import { Spacings } from '~utils/Spacings'
import { ModalAlert } from '~utils/Toast'
import { calculateMarks } from '~utils/calculateMarks'
import type { S_SUBJECT_TOTALS, TermNavigationParamMap } from '../navigation'
import { ToGetMarkChip } from '../term/ToGetMarkChip'
import { AddMarkForm } from './AddMarkForm'

type ScreenProps = StackScreenProps<
	TermNavigationParamMap,
	typeof S_SUBJECT_TOTALS
>

export default observer(function SubjectTotals({
	route,
	navigation,
}: ScreenProps) {
	const { termId, subjectId, finalMark } = route.params ?? {}
	const { studentId } = Settings
	const studentSettings = Settings.forStudentOrThrow()
	const performance = SubjectPerformanceStores.use({
		studentId,
		subjectId,
	})
	performance.withParams({ termId })

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
	const {
		avgMark,
		totalsAndSheduledTotals,
		maxWeight,
		minWeight,
		toGetTarget,
	} = marks

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
					style={{ padding: Spacings.s1 }}
					textStyle={{ fontSize: 18 }}
				/>
			</View>
			<ScrollView
				refreshControl={performance.refreshControl}
				contentContainerStyle={{ gap: Spacings.s2 }}
			>
				<ScrollView
					style={{ padding: Spacings.s2, marginRight: Spacings.s2 }}
					contentContainerStyle={{ gap: Spacings.s2 }}
					horizontal
					showsHorizontalScrollIndicator={false}
					fadingEdgeLength={100}
				>
					<ToGetMarkChip toGetTarget={toGetTarget} />
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
				</ScrollView>
				{totalsAndSheduledTotals.map((e, i) => (
					<MarkRow
						mark={e}
						maxWeight={maxWeight}
						minWeight={minWeight}
						navigation={navigation}
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
					{customMarks.length ? (
						<Text>
							Возможных оценок:{' '}
							<Text variant="labelLarge">{customMarks.length}</Text>
						</Text>
					) : (
						false
					)}
					<Text>
						Учитель:{' '}
						<Text variant="labelLarge">
							{performance.result.teachers
								.map(e => Settings.fullname(e.name))
								.join(', ')}
						</Text>
					</Text>
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
				</RoundedSurface>
				<UpdateDate store={performance} />
			</ScrollView>
		</View>
	)
})

const MarkRow = observer(function MarkRow({
	mark,
	maxWeight,
	minWeight,
	onDelete,
	navigation,
}: {
	mark: Partial<PartialAssignment>
	maxWeight: number
	minWeight: number
	onDelete: VoidFunction
	navigation: ScreenProps['navigation']
}) {
	Theme.key
	const date = mark.classMeetingDate ?? mark.date
	const assignment = MarkAssignmentsStore.result?.find(
		e => e.assignmentId === mark.assignmentId,
	)
	return (
		<View
			style={[
				styles.stretch,
				{
					paddingTop: Spacings.s1,
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
				}}
				onPress={() => {
					const title = `${mark.assignmentTypeName ?? ''} ${mark.result ?? 'Оценки нет'}`
					ModalAlert.show(
						title,
						<MarkInfo
							mark={mark}
							assignment={assignment}
							navigation={navigation}
						/>,
					)
				}}
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
	navigation,
}: {
	mark: Partial<PartialAssignment>
	assignment?: Assignment
	navigation: ScreenProps['navigation']
}) {
	const appearDate = mark.date ? new Date(mark.date) : undefined
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
					<Button
						onPress={() => {
							DiaryState.day = date.toYYYYMMDD()
							navigation.getParent()?.navigate(LANG.s_diary)
							ModalAlert.close()
						}}
						mode="contained-tonal"
					>
						Перейти ко дню
					</Button>
				</>
			)}
		</View>
	)
})