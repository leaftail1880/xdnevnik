import { Picker } from '@react-native-picker/picker'
import * as Notifications from 'expo-notifications'
import { useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { Loading } from '../components/loading'
import { LANG, SECONDARY_COLOR, STYLES } from '../constants'
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
					const previous = diary.lessons[-i]

					if (
						previous &&
						lesson.start.toYYYYMMDD() === previous.day.toYYYYMMDD()
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
					borderRadius: 10,
					color: STYLES.buttonText.color,
				}}
				selectedValue={diaryDay}
				onValueChange={setDiaryDay}
			>
				<Picker.Item label={LANG['monday']} value={Date.week[0]} />
				<Picker.Item label={LANG['tuesday']} value={Date.week[1]} />
				<Picker.Item label={LANG['wednesday']} value={Date.week[2]} />
				<Picker.Item label={LANG['thursday']} value={Date.week[3]} />
				<Picker.Item label={LANG['friday']} value={Date.week[4]} />
				<Picker.Item label={LANG['saturday']} value={Date.week[5]} />
				<Picker.Item label={LANG['sunday']} value={Date.week[6]} />
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
