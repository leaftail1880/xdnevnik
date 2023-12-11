import * as Notifications from 'expo-notifications'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { Colors, ProgressBar, Spacings, Text, View } from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import { Assignment, Diary } from '../NetSchool/classes'
import { IconButton } from '../components/Button'
import { DiaryAssignment } from '../components/DiaryAssignment'
import { Dropdown } from '../components/Dropdown'
import { SubjectName, getSubjectName } from '../components/SubjectName'
import { LANG } from '../constants'
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

	const classsmetingsIds = useMemo(
		() => diary.result?.lessons.map(e => e.classmeetingId),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[diary.result?.lessons.map(e => e.classmeetingId).join('=')]
	)

	const homework = useAPI(
		API,
		'assignments',
		{
			studentId,
			classmetingsIds: classsmetingsIds,
		},
		'оценок'
	)

	useEffect(() => {
		if (!settings.notifications) {
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
						studentId: studentId!,
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
	}, [settings.notifications, diary, settings, studentId])

	const weekBefore = new Date()
	const weekAfter = new Date()

	weekBefore.setDate(weekDate.getDate() - 7)
	weekAfter.setDate(weekDate.getDate() + 7)

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
							.sort((a, b) => a.order - b.order)
							.map(lesson => (
								<DiaryDay
									lesson={lesson}
									homework={homework}
									diary={diary.result}
									key={lesson.classmeetingId.toString()}
								/>
							))}
				</View>
				<Text center $textDisabled marginB-20>
					{diary.updateDate}
				</Text>
			</ScrollView>
		</View>
	)
}

function DiaryDay({
	lesson,
	homework,
}: {
	lesson: Diary['lessons'][number]
	homework: APIState<Assignment[]>
	diary: Diary
}) {
	return (
		<View
			margin-s2
			br20
			bg-$backgroundAccent
			style={{
				alignItems: 'flex-start',
				elevation: 3,
				minWidth: 280,
			}}
		>
			<View
				row
				spread
				centerV
				padding-s3
				backgroundColor={Colors.rgba(Colors.$backgroundPrimaryHeavy, 0.4)}
				br20
				style={{
					width: '100%',
				}}
			>
				<SubjectName
					iconsSize={18}
					style={{
						fontWeight: 'bold',
						maxWidth: '90%',
						fontSize: 18,
						color: Colors.$textAccent,
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
			<View
				margin-s3
				style={{
					width: '100%',
				}}
			>
				<Text text50 color={Colors.rgba(Colors.$textAccent, 0.7)}>
					{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
				</Text>

				<Text color={Colors.rgba(Colors.$textAccent, 0.7)}>
					{lesson.lessonTheme}
				</Text>

				{lesson.attachmentsExists && (
					<Text color={Colors.rgba(Colors.$textAccent, 0.7)} marginB-s2>
						Есть дз ввиде файла
					</Text>
				)}
			</View>

			<View
				backgroundColor={Colors.rgba(Colors.$backgroundElevated, 0.3)}
				br30
				margin-s2
				padding-s1
				style={{ width: '96%' }}
			>
				{homework.fallback ||
					homework.result
						.filter(
							e =>
								e.classmeetingId === lesson.classmeetingId ||
								(!e.weight &&
									new Date(e.assignmentDate).toYYYYMMDD() ===
										lesson.start.toYYYYMMDD())
						)
						.map(e => <DiaryAssignment assignment={e} key={e.assignmentId} />)}
			</View>

			<LessonProgress lesson={lesson} />
		</View>
	)
}

function LessonProgress({ lesson }: { lesson: Diary['lessons'][number] }) {
	const [now, setNow] = useState(Date.now())
	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000 * 3)

		return () => clearInterval(interval)
	}, [])

	const start = lesson.start.getTime()
	const end = lesson.end.getTime()

	if (now < start) {
		// Not started yet
		const minsBeforeStart = ~~((start - now) / (1000 * 60))

		// Do not show time above 15 mins
		if (minsBeforeStart < 15) {
			return <Text>Начнется через {minsBeforeStart} мин</Text>
		}
	} else if (now <= end) {
		// Lesson is going right now
		const minsBeforeEnd = ~~((end - now) / (1000 * 60))
		const minsTotal = ~~((end - start) / (1000 * 60))

		return (
			<View
				style={{
					width: '95%',
				}}
				row
				spread
				centerV
			>
				<View
					style={{
						width: '80%',
					}}
					marginR-s2
				>
					<ProgressBar
						style={{
							width: '100%',
							height: 20,
						}}
						progress={100 - ~~(((end - now) * 100) / (end - start))}
						progressColor={Colors.$textAccent}
					/>
				</View>
				<Text>
					{minsBeforeEnd}/{minsTotal} мин
				</Text>
			</View>
		)
	} else {
		// Lesson is ended
		return <Text $textPrimaryLight>Закончился</Text>
	}
}
