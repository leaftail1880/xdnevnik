import * as Notifications from 'expo-notifications'
import { useContext, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { Colors, ProgressBar, View } from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import { Assignment } from '../NetSchool/classes'
import { Button } from '../components/Button'
import { Dropdown } from '../components/Dropdown'
import { Mark } from '../components/Mark'
import { SubjectName, getSubjectName } from '../components/SubjectName'
import { Text } from '../components/Text'
import { LANG, LOGGER, styles } from '../constants'
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
		{ studentId, withExpiredClassAssign: true, withoutMarks: false },
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
		{ name: 'Прошлая неделя', day: Date.week(weekBefore)[0], week: weekBefore },
		...Date.week(weekDate).map((day, i) => {
			const today = new Date().toYYYYMMDD() === day
			return {
				name: `${LANG.days[i]}${
					today ? ', cегодня' : ' ' + new Date(day).toLocaleDateString([])
				}`,
				day: day,
				selected: day === diaryDay,
			}
		}),
		{
			name: 'Следующая неделя',
			day: Date.week(weekAfter)[0],
			week: weekAfter,
			selected: false,
		},
	]

	return (
		<ScrollView
			contentContainerStyle={{
				justifyContent: 'center',
				alignContent: 'center',
			}}
		>
			<Dropdown
				dropdownStyle={{ minHeight: 350, borderRadius: 10 }}
				data={values}
				defaultButtonText="День недели"
				buttonTextAfterSelection={i => i.name}
				renderCustomizedRowChild={i => (
					<Text $textDisabled={i.selected} center>
						{i.name}
					</Text>
				)}
				defaultValue={values.find(e => e.day === diaryDay)}
				onSelect={item => {
					if ('week' in item) setWeekDate(item.week)
					setDiaryDay(item.day)
				}}
			/>
			<View padding-s1>
				{diary.fallback ||
					diary.result.forDay(diaryDay).map(lesson => {
						return (
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
								<Text style={[styles.buttonText, { fontSize: 17 }]}>
									{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
								</Text>
								{homework.fallback ||
									homework.result
										.filter(e => e.classmeetingId === lesson.classmetingId)
										.map(e => <Homework homework={e} key={e.assignmentId} />)}
								{lesson.lessonTheme && (
									<Text style={styles.buttonText}>
										Тема урока: {lesson.lessonTheme + '\n'}
									</Text>
								)}

								{diary.result.isNow(lesson) && (
									<ProgressBar
										style={{ width: '100%', height: 20 }}
										progress={100 - ~~(((lesson.end.getTime() - Date.now()) * 100) /
										(lesson.end.getTime() - lesson.start.getTime()))}
										progressColor={Colors.$backgroundNeutralIdle}
									/>
								)}
							</View>
						)
					})}
			</View>
		</ScrollView>
	)
}

function Homework(props: { homework: Assignment }) {
	const assignment = props.homework
	const [showHw, setShowHw] = useState(false)
	return (
		<View flex row spread margin-0 padding-0 centerV>
			{assignment.assignmentTypeName && (
				<Button
					onPress={() => setShowHw(!showHw)}
					style={{
						borderColor: Colors.$backgroundDefault,
						borderWidth: 3,
						width: 30,
						height: 30,
					}}
					centerH
					centerV
					br20
				>
					<Text style={styles.buttonText} margin-0>
						{assignment.assignmentTypeAbbr}
					</Text>
				</Button>
			)}
			{showHw && (
				<Text style={styles.buttonText} margin-s1>
					{assignment.assignmentName}
				</Text>
			)}
			{assignment.result && (
				<Mark
					mark={assignment.result}
					style={{ width: 30, height: 30, padding: 0 }}
					textStyle={{ fontSize: 15 }}
				/>
			)}
		</View>
	)
}
