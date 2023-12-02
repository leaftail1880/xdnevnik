import * as Notifications from 'expo-notifications'
import { useContext, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { Colors, ProgressBar, Spacings, Text, View } from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import { Assignment, Diary } from '../NetSchool/classes'
import { IconButton, SmallButton } from '../components/Button'
import { Dropdown } from '../components/Dropdown'
import { Mark } from '../components/Mark'
import { SubjectName, getSubjectName } from '../components/SubjectName'
import { LANG, LOGGER } from '../constants'
import { APIState, useAPI } from '../hooks/api'
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
		{
			name: 'Прошлая неделя',
			day: Date.week(weekBefore)[0],
			week: weekBefore,
			selected: false,
		},
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
		<View>
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
			<ScrollView
				contentContainerStyle={{
					justifyContent: 'center',
					alignContent: 'center',
					paddingBottom: Spacings.s10,
				}}
				refreshControl={diary.refreshControl}
			>
				<View padding-s1>
					{diary.fallback ||
						diary.result
							.forDay(diaryDay)
							.map(lesson => (
								<DiaryDay
									lesson={lesson}
									homework={homework}
									diary={diary.result}
									key={lesson.id.toString()}
								/>
							))}
				</View>
				<Text center $textDisabled marginB-s3>
					{diary.updateDate}
				</Text>
			</ScrollView>
		</View>
	)
}

function DiaryDay({
	lesson,
	homework,
	diary,
}: {
	lesson: Diary['lessons'][number]
	homework: APIState<Assignment[]>
	diary: Diary
}) {
	if (homework.result) {
		// homework.result.forEach(
		// 	e => e.subjectName === 'Биология' && LOGGER.debug(e)
		// )
		homework.result
			.filter(
				e => e.subjectName === 'Биология' //&&
				// 	e.classmeetingId === lesson.classmetingId) ||
				// (!e.weight &&
				// 	new Date(e.assignmentDate).toYYYYMMDD() ===
				// 		lesson.start.toYYYYMMDD())
			)
			.forEach(e => LOGGER.debug(e))
	}

	return (
		<View
			margin-s2
			padding-s3
			br20
			bg-$backgroundAccent
			style={{
				alignItems: 'flex-start',
				elevation: 3,
				minWidth: 250,
			}}
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
					iconsSize={18}
					marginT-0
					style={{
						fontWeight: 'bold',
						fontSize: 18,
						color: Colors.$textAccent,
					}}
					subjectId={lesson.subjectId}
					subjectName={lesson.subjectName}
				/>

				<View row spread centerV>
					<Text
						margin-s1
						marginT-0
						style={{
							fontWeight: 'bold',
							fontSize: 18,
							color: Colors.$textAccent,
						}}
					>
						{lesson.roomName ?? 'Нет кабинета'}
					</Text>
					<IconButton
						iconColor={Colors.$textAccent}
						icon="pencil"
						size={18}
						marginL-s1
					/>
				</View>
			</View>
			<Text text50 $textAccent>
				{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
			</Text>

			{lesson.lessonTheme && (
				<Text $textAccent>Тема урока: {lesson.lessonTheme + '\n'}</Text>
			)}

			{homework.fallback ||
				homework.result
					.filter(
						e =>
							e.classmeetingId === lesson.classmetingId ||
							(!e.weight &&
								new Date(e.assignmentDate).toYYYYMMDD() ===
									lesson.start.toYYYYMMDD())
					)
					.map(e => <Homework homework={e} key={e.assignmentId} />)}

			{diary.isNow(lesson) && (
				<ProgressBar
					style={{ width: '100%', height: 20 }}
					progress={
						100 -
						~~(
							((lesson.end.getTime() - Date.now()) * 100) /
							(lesson.end.getTime() - lesson.start.getTime())
						)
					}
					progressColor={Colors.$backgroundNeutralIdle}
				/>
			)}
		</View>
	)
}

function Homework(props: { homework: Assignment }) {
	const assignment = props.homework
	const [showHw, setShowHw] = useState(
		// Do not show long hw by default
		assignment.assignmentTypeName.length < 20
	)
	return (
		<View
			flex
			row
			spread
			margin-s1
			padding-0
			centerV
			style={{ maxWidth: '100%' }}
		>
			{assignment.assignmentTypeName && (
				<SmallButton
					onPress={() => setShowHw(!showHw)}
					style={{
						borderColor: Colors.$textAccent,
						borderWidth: 3,
					}}
					centerH
					centerV
					br20
				>
					<Text $textAccent margin-s1>
						{assignment.assignmentTypeAbbr}
					</Text>
				</SmallButton>
			)}
			{showHw && (
				<Text $textAccent margin-s1>
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
