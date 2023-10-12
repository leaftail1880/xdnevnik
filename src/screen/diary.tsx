import { Picker } from '@react-native-picker/picker'
import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { Loading } from '../components/loading'
import { ACCENT_COLOR, LANG, SECONDARY_COLOR, STYLES } from '../constants'
import { useAsync } from '../hooks/async'
import { SettingsCtx } from '../hooks/settings'

export function DiaryScreen(props: {
	ctx: {
		studentId?: number
		settings: SettingsCtx
	}
}) {
	const { studentId, settings } = props.ctx
	const [diaryDay, setDiaryDay] = useState(new Date().toYYYYMMDD())
	const [diary, FallbackDiary] = useAsync(
		() => API.diary({ studentId: studentId! }),
		'дневника',
		[API.changes, studentId]
	)

	useEffect(() => {
		// console.log('useEffect::notifications')
		if (!settings.notifications) {
			console.log('notifications are disabled')
			Notifications.cancelAllScheduledNotificationsAsync()
			return
		}

		if (diary) {
			Notifications.cancelAllScheduledNotificationsAsync().then(() => {
				for (const [i, lesson] of diary.lessons.entries()) {
					let period: Date | undefined
					let date: Date
					const previous = diary.lessons[i - 1]

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

					Notifications.scheduleNotificationAsync({
						content: {
							title: `${lesson.subjectName} | ${
								lesson.roomName ?? 'Нет кабинета'
							}`,
							body: `Время урока ${lesson.start.toHHMM()} - ${lesson.end.toHHMM()}. ${
								period ? 'Сейчас перемена ' + period.getMinutes() + ' мин' : ''
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
	}, [settings.notifications, diary])

	if (!API.loggedIn) return <Loading text="Ожидание авторизации{dots}" />

	return (
		<ScrollView
			contentContainerStyle={{
				justifyContent: 'center',
				alignContent: 'center',
			}}
		>
			<Picker
				style={{
					alignSelf: 'stretch',
					backgroundColor: SECONDARY_COLOR,
					borderRadius: 5,
					color: STYLES.buttonText.color,
				}}
				selectedValue={diaryDay}
				onValueChange={setDiaryDay}
			>
				{Date.week.map((day, i) => {
					return (
						<Picker.Item
							label={`${LANG.days[i]}${
								new Date().toYYYYMMDD() === day
									? ', cегодня'
									: ' ' +
									  new Date(day).toLocaleDateString([], { dateStyle: 'full' })
							}`}
							value={day}
							key={day}
							style={day === diaryDay ? { color: ACCENT_COLOR } : {}}
						/>
					)
				})}
			</Picker>
			{FallbackDiary ||
				diary.forDay(diaryDay).map(lesson => (
					<View
						key={lesson.id.toString()}
						style={{
							...STYLES.button,
							alignItems: 'flex-start',
							marginBottom: 1,
						}}
					>
						<Text
							style={{ fontWeight: 'bold', ...STYLES.buttonText, fontSize: 15 }}
						>
							{lesson.subjectName}
						</Text>
						<View
							style={{
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
								minWidth: 350,
							}}
						>
							<Text style={STYLES.buttonText}>
								{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
							</Text>
							<Text style={STYLES.buttonText}>
								{lesson.roomName ?? 'Кабинет не указан'}
							</Text>
						</View>
						{lesson.lessonTheme && (
							<Text style={STYLES.buttonText}>{lesson.lessonTheme + '\n'}</Text>
						)}
					</View>
				))}
		</ScrollView>
	)
}
