import * as Notifications from 'expo-notifications'
import { useContext, useEffect, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { API } from '../NetSchool/api'
import { Dropdown } from '../components/dropdown'
import {
	ACCENT_COLOR,
	LANG,
	LOGGER,
	SECONDARY_COLOR,
	styles,
} from '../constants'
import { useAPI } from '../hooks/api'
import { APP_CTX } from '../hooks/settings'

export function DiaryScreen() {
	const { studentId, settings } = useContext(APP_CTX)
	const [diaryDay, setDiaryDay] = useState(new Date().toYYYYMMDD())
	const { result: diary, fallback: FallbackDiary } = useAPI(
		API,
		'diary',
		{ studentId },
		'дневника'
	)

	useEffect(() => {
		if (!settings.notifications) {
			LOGGER.info('notifications are disabled')
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
	}, [settings.notifications, diary])

	const values = Date.week.map((day, i) => {
		return {
			name: `${LANG.days[i]}${
				new Date().toYYYYMMDD() === day
					? ', cегодня'
					: ' ' + new Date(day).toLocaleDateString([], { dateStyle: 'full' })
			}`,
			day: day,
		}
	})

	return (
		<ScrollView
			contentContainerStyle={{
				justifyContent: 'center',
				alignContent: 'center',
			}}
		>
			<Dropdown
				buttonStyle={{
					alignSelf: 'stretch',
					backgroundColor: SECONDARY_COLOR,
					width: '100%',
					borderRadius: 5,
				}}
				dropdownStyle={{ width: '100%', borderRadius: 5, minHeight: 350 }}
				buttonTextStyle={styles.buttonText}
				data={values}
				buttonTextAfterSelection={i => i.name}
				renderCustomizedRowChild={i => (
					<Text
						style={[
							i.day === diaryDay ? { color: ACCENT_COLOR } : {},
							{ textAlign: 'center', fontSize: 15 },
						]}
					>
						{i.name}
					</Text>
				)}
				defaultValue={values.find(e => e.day === diaryDay)}
				onSelect={item => setDiaryDay(item.day)}
			/>
			{FallbackDiary ||
				diary.forDay(diaryDay).map(lesson => (
					<View
						key={lesson.id.toString()}
						style={{
							...styles.button,
							alignItems: 'flex-start',
							marginBottom: 1,
						}}
					>
						<Text
							style={{ fontWeight: 'bold', ...styles.buttonText, fontSize: 15 }}
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
							<Text style={styles.buttonText}>
								{lesson.start.toHHMM()} - {lesson.end.toHHMM()}
							</Text>
							<Text style={styles.buttonText}>
								{lesson.roomName ?? 'Кабинет не указан'}
							</Text>
						</View>
						{lesson.lessonTheme && (
							<Text style={styles.buttonText}>{lesson.lessonTheme + '\n'}</Text>
						)}
					</View>
				))}
		</ScrollView>
	)
}
