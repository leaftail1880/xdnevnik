import { useTheme } from '@react-navigation/native'
import * as Notifications from 'expo-notifications'
import { useContext, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { View } from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import { Assignment } from '../NetSchool/classes'
import { Dropdown } from '../components/Dropdown'
import { Mark } from '../components/Mark'
import { SubjectName, getSubjectName } from '../components/SubjectName'
import { Text } from '../components/Text'
import { LANG, LOGGER, SECONDARY_COLOR, styles } from '../constants'
import { useAPI } from '../hooks/api'
import { Ctx } from '../hooks/settings'

export function DiaryScreen() {
	const { studentId, settings } = useContext(Ctx)
	const [diaryDay, setDiaryDay] = useState(new Date().toYYYYMMDD())
	const [weekDate, setWeekDate] = useState(new Date())

	const weekDays = Date.week(weekDate)

	const diary = useAPI(
		API,
		'diary',
		{
			studentId,
			startDate: weekDays[0],
			endDate: weekDays[6],
		},
		'дневника'
	)

	const homework = useAPI(
		API,
		'homework',
		{ studentId, withExpiredClassAssign: true, withoutMarks: true },
		'дз'
	)

	useEffect(() => {
		if (!settings.notifications) {
			LOGGER.info('notifications are disabled')
			Notifications.cancelAllScheduledNotificationsAsync()
			return
		}

		if (diary.result) {
			Notifications.cancelAllScheduledNotificationsAsync().then(() => {
				for (const [i, lesson] of diary.result.lessons.entries()) {
					let period: Date | undefined
					let date: Date
					const previous = diary.result.lessons[i - 1]

					if (
						previous &&
						lesson.day.toYYYYMMDD() === previous.day.toYYYYMMDD()
					) {
						// If previous lesson in the same day, send notification in the end of it
						date = previous.end
						period = new Date(lesson.start.getTime() - previous.end.getTime())
					} else {
						date = lesson.start
						// Send by 5 mins before lesson
						date.setMinutes(date.getMinutes() - 15)
					}

					const lessonName = getSubjectName({
						subjectId: lesson.subjectId,
						subjectName: lesson.subjectName,
						settings,
					})

					Notifications.scheduleNotificationAsync({
						content: {
							title: `${lessonName} | ${lesson.roomName ?? 'Нет кабинета'}`,
							body: `Урок ${lesson.start.toHHMM()} - ${lesson.end.toHHMM()}. ${
								period ? 'Перемена ' + period.getMinutes() + ' мин' : ''
							}`,
							sound: false,
						},
						trigger: {
							repeats: true,
							weekday: date.getDay() + 1,
							hour: date.getHours(),
							minute: date.getMinutes(),
						},
					}).then(() => {
						// console.log('Shedulled notification', e)/
					})
				}
			})
		}
	}, [settings.notifications, diary, settings])

	const weekBefore = new Date()
	const weekAfter = new Date()

	weekBefore.setDate(weekBefore.getDate() - 7)
	weekAfter.setDate(weekAfter.getDate() + 7)

	const values = [
		{ name: 'Прошлая неделя', day: undefined, week: weekBefore },
		...Date.week(weekDate).map((day, i) => {
			return {
				name: `${LANG.days[i]}${
					new Date().toYYYYMMDD() === day
						? ', cегодня'
						: ' ' + new Date(day).toLocaleDateString([], { dateStyle: 'full' })
				}`,
				day: day,
			}
		}),
		{ name: 'Следующая неделя', day: undefined, week: weekAfter },
	]

	const theme = useTheme()

	return (
		<ScrollView
			contentContainerStyle={{
				justifyContent: 'center',
				alignContent: 'center',
			}}
		>
			<Dropdown
				buttonStyle={styles.dropdown}
				dropdownStyle={{ minHeight: 350 }}
				buttonTextStyle={styles.buttonText}
				data={values}
				defaultButtonText="День недели"
				buttonTextAfterSelection={i => i.name}
				renderCustomizedRowChild={i => (
					<Text
						{...(i.day === diaryDay && { grey1: true })}
						style={{ textAlign: 'center' }}
					>
						{i.name}
					</Text>
				)}
				defaultValue={values.find(e => e.day === diaryDay)}
				onSelect={item => {
					if ('week' in item) setWeekDate(item.week)
					else setDiaryDay(item.day)
				}}
			/>
			<View padding-0 paddingB-10>
				{diary.fallback ||
					diary.result.forDay(diaryDay).map(lesson => (
						<View
							key={lesson.id.toString()}
							style={[
								styles.button,
								{
									margin: 7,
									alignItems: 'flex-start',
								},
							]}
						>
							<View
								flex
								row
								spread
								centerV
								marginB-7
								style={{
									width: '100%',
								}}
							>
								<SubjectName
									style={[
										styles.buttonText,
										{
											fontWeight: 'bold',
											marginTop: 0,
											fontSize: 18,
										},
									]}
									subjectId={lesson.subjectId}
									subjectName={lesson.subjectName}
								/>

								<Text
									style={[
										styles.buttonText,
										{
											fontWeight: 'bold',
											fontSize: 18,
											marginTop: 0,
											margin: 7,
										},
									]}
								>
									{lesson.roomName ?? 'Нет кабинета'}
								</Text>
							</View>
							<Text style={styles.buttonText}>
								{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
							</Text>
							{lesson.lessonTheme && (
								<Text style={styles.buttonText}>
									Тема урока: {lesson.lessonTheme + '\n'}
								</Text>
							)}
							{homework.fallback || (
								<Homework
									homework={homework.result}
									classmetingId={lesson.classmetingId}
								/>
							)}
							{diary.result.isNow(lesson) && (
								<View
									style={{
										backgroundColor: theme.colors.background,
										borderRadius: 5,
										padding: 0,
									}}
								>
									<View
										style={{
											backgroundColor: SECONDARY_COLOR,
											width: `${~~(
												(lesson.end.getDate() - lesson.start.getDate()) /
												(lesson.end.getDate() - Date.now())
											)}%`,
											padding: 0,
										}}
									></View>
								</View>
							)}
						</View>
					))}
			</View>
		</ScrollView>
	)
}

function Homework(props: { homework: Assignment[]; classmetingId: number }) {
	const assignment = props.homework.find(
		e => e.classmeetingId === props.classmetingId
	)

	if (!assignment) return false

	return (
		<View style={styles.stretch}>
			{assignment.description && (
				<Text style={styles.buttonText}>Дз: {assignment.description}</Text>
			)}
			{assignment.assignmentTypeName && (
				<Text style={styles.buttonText}>
					Тип оценки: {assignment.assignmentTypeName}
				</Text>
			)}
			{assignment.result && (
				<Mark
					mark={assignment.result}
					markWeight={{
						max: assignment.weight,
						min: assignment.weight,
						current: assignment.weight,
					}}
				/>
			)}
		</View>
	)
}
