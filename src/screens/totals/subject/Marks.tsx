import Mark from '@/components/Mark'
import { LANG, globalStyles } from '@/constants'
import { XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { DiaryState } from '@/screens/day/state'
import { Assignment, PartialAssignment } from '@/services/net-school/entities'
import { MarkAssignmentsStore } from '@/services/net-school/store'
import {
	MarksNotificationStore,
	StudentMarksStorage,
} from '@/services/notifications/marks'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { formatDistanceToNow, formatDuration } from 'date-fns'
import { ru } from 'date-fns/locale'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { IconButton, Text } from 'react-native-paper'

export const SubjectTotalMarkRow = observer(function MarkRow({
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
	const onPress = useCallback(() => {
		if (!XSettings.studentId) return

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

		const studentStore = MarksNotificationStore.getStudent(XSettings.studentId)

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
	}, [assignment, mark, navigateToDiary])
	useEffect(() => {
		runInAction(() => {
			if (mark.assignmentId && XSettings.studentId) {
				const studentStorage = MarksNotificationStore.getStudent(
					XSettings.studentId,
				)
				studentStorage.seen.push(mark.assignmentId)
			}
		})
	}, [mark.assignmentId])

	return (
		<View style={styles.markRowContainer}>
			<Mark
				duty={mark.duty ?? false}
				mark={mark.result ?? null}
				weight={mark.weight}
				minWeight={minWeight}
				maxWeight={maxWeight}
				style={styles.markRowMark}
				onPress={onPress}
				unseen={
					!!mark.assignmentId &&
					!!XSettings.studentId &&
					MarksNotificationStore.isUnseen(
						XSettings.studentId,
						mark.assignmentId,
					)
				}
			/>
			<View style={styles.markRowRowTextView}>
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

const styles = StyleSheet.create({
	markRowContainer: {
		...globalStyles.stretch,
		paddingHorizontal: Spacings.s2,
		gap: Spacings.s1,
	},
	markRowMark: {
		paddingHorizontal: Spacings.s2 * 1.5,
		paddingVertical: 2,
		minWidth: 40,
	},
	markRowRowTextView: {
		marginHorizontal: Spacings.s1,
		alignContent: 'center',
		flex: 4,
	},
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
