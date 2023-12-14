import * as Notifications from 'expo-notifications'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import {
	BorderRadiuses,
	Colors,
	Image,
	ProgressBar,
	Spacings,
	Switch,
	Text,
	View,
} from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import { Assignment, Attachment, Diary } from '../NetSchool/classes'
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
	const [showHomework, setShowHomework] = useState(true)

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

	const classmetingsIds = useMemo(
		() => diary.result?.lessons.map(e => e.classmeetingId),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[diary.result?.lessons.map(e => e.classmeetingId).join('=')]
	)

	const homework = useAPI(
		API,
		'assignments',
		{
			studentId,
			classmetingsIds: showHomework ? classmetingsIds : undefined,
		},
		'оценок'
	)

	const withAttachments = useMemo(
		() =>
			homework.result
				?.filter(e => e.attachmentsExists)
				.map(e => e.assignmentId),

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			// eslint-disable-next-line react-hooks/exhaustive-deps
			homework.result
				?.filter(e => e.attachmentsExists)
				.map(e => e.assignmentId)
				.join('='),
		]
	)

	const attachments = useAPI(
		API,
		'attachments',
		{
			studentId,
			assignmentIds:
				withAttachments?.length !== 0 ? withAttachments : undefined,
		},
		'файлов'
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
				<View padding-s1 flex>
					<View flex row spread padding-s1>
						<Text margin-s1>Оценки</Text>
						<Switch
							margin-s1
							onValueChange={setShowHomework}
							value={showHomework}
						/>
					</View>
				</View>
				<View padding-s1>
					{diary.fallback ||
						(() => {
							const day = diary.result.forDay(diaryDay)
							if (day.length === 0)
								return (
									<Text center text30>
										Уроков нет
									</Text>
								)
							return day
								.sort((a, b) => a.order - b.order)
								.map(lesson => (
									<DiaryDay
										homeworkEnabled={showHomework}
										attachments={attachments}
										lesson={lesson}
										homework={homework}
										diary={diary.result}
										key={lesson.classmeetingId.toString()}
									/>
								))
						})()}
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
	attachments,
	homeworkEnabled,
}: {
	lesson: Diary['lessons'][number]
	homework: APIState<Assignment[]>
	attachments: APIState<Attachment[]>
	homeworkEnabled: boolean
	diary: Diary
}) {
	return (
		<View
			margin-s2
			br20
			bg-$backgroundAccent
			style={{
				alignItems: 'flex-start',
				elevation: 15,
				minWidth: 280,
			}}
		>
			<View
				row
				spread
				centerV
				padding-s3
				backgroundColor={Colors.$backgroundPrimaryLight}
				br20
				style={{
					width: '100%',
					elevation: 10,
				}}
			>
				<SubjectName
					iconsSize={18}
					style={{
						fontWeight: 'bold',
						maxWidth: '90%',
						fontSize: 18,
						color: Colors.$textDefault,
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
						{lesson.roomName ?? 'Нет кабинета'}
					</Text>
					<IconButton
						iconColor={Colors.$textDefault}
						icon="pencil"
						size={18}
						marginL-s1
					/>
				</View>
			</View>
			<View
				marginV-s1
				marginH-s3
				style={{
					width: '100%',
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

			<LessonProgress lesson={lesson} />
			{homeworkEnabled && (
				<View
					backgroundColor={Colors.rgba(Colors.white, 0.2)}
					br20
					style={{ width: '100%' }}
				>
					{homework.fallback ||
						(() => {
							const ourResults = homework.result.filter(
								e =>
									e.classmeetingId === lesson.classmeetingId ||
									(!e.weight &&
										new Date(e.assignmentDate).toYYYYMMDD() ===
											lesson.start.toYYYYMMDD())
							)

							if (ourResults.length) {
								return [
									<CustomFader key={'fader'} />,
									...ourResults.map(e => (
										<DiaryAssignment
											assignment={e}
											attachments={attachments}
											key={e.assignmentId}
										/>
									)),
								]
							}
						})()}
				</View>
			)}
		</View>
	)
}

function CustomFader() {
	return (
		<View
			style={{
				position: 'absolute',
				top: 0,
				width: '100%',
				height: 50,
			}}
		>
			<Image
				source={require('react-native-ui-lib/src/components/fader/gradientTop.png')}
				resizeMode="stretch"
				style={{
					width: '100%',
					height: 50,
					borderRadius: BorderRadiuses.br20,
				}}
				tintColor={Colors.rgba(Colors.$backgroundDark, 0.5)}
			/>
		</View>
	)
}

function LessonProgress({ lesson }: { lesson: Diary['lessons'][number] }) {
	// const now = new Date(2023, 11, 12, 8, 30).getTime()
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
			return (
				<Text
					color={Colors.rgba(Colors.$textAccent, 0.5)}
					center
					marginH-s3
					marginB-s2
				>
					Начнется через {minsBeforeStart} мин
				</Text>
			)
		}
	} else if (now <= end) {
		// Lesson is going right now
		const minsBeforeEnd = ~~((now - start) / (1000 * 60))
		const minsTotal = ~~((end - start) / (1000 * 60))

		return (
			<View row center marginH-s3 paddingH-s2 marginB-s2 centerV>
				<View
					style={{
						width: '80%',
					}}
				>
					<ProgressBar
						style={{
							width: '100%',
							height: 20,
							backgroundColor: Colors.rgba(Colors.black, 0.3),
						}}
						progress={100 - ~~(((end - now) * 100) / (end - start))}
						progressColor={Colors.$textAccent}
					/>
				</View>
				<Text $textAccent margin-s1>
					{minsBeforeEnd}/{minsTotal} мин
				</Text>
			</View>
		)
	} else {
		// Lesson is ended
		return (
			<Text
				color={Colors.rgba(Colors.$textAccent, 0.5)}
				center
				marginH-s3
				marginB-s2
			>
				Закончился
			</Text>
		)
	}
}
