import { HoursMinutes, SelectTime } from '@/components/SelectTime'
import { getSubjectName } from '@/components/SubjectName'
import { LANG } from '@/constants'
import { XSettings } from '@/models/settings'
import { Lesson } from '@/services/net-school/lesson'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { View } from 'react-native'
import { Button, Text, TextInput } from 'react-native-paper'
import { setLessonTimeOffset } from './state'

export const EditSingleLesson = observer(function EditSingleLesson({
	lesson,
}: {
	lesson: Lesson
}) {
	const studentSettings = XSettings.forStudentOrThrow()
	const [startTime, setStartTime] = useState(
		dateToHoursMinutes(lesson.start(studentSettings)),
	)
	const [name, setName] = useState(getSubjectName(lesson))
	return (
		<View style={{ gap: Spacings.s2 }}>
			<Text>
				Это изменит только конкретный урок во{' '}
				{LANG.days[lesson.dayDate.getDayFromMonday()].toLowerCase()}, если вам
				нужно переименовать предмет для всех дней, нажмите на его название на
				странице дневника
			</Text>
			<Text>
				Время в журнале: {lesson.startDate.toHHMM()} - {lesson.endDate.toHHMM()}
			</Text>
			<Text>Название предмета в журнале: {lesson.subjectName}</Text>
			<TextInput
				mode="outlined"
				value={name}
				onChangeText={t => setName(t)}
				defaultValue={lesson.subjectName}
			></TextInput>
			<SelectTime label="Начало" value={startTime} onSelect={setStartTime} />

			<Button
				mode="outlined"
				onPress={() => {
					runInAction(() => {
						delete studentSettings.subjectNamesDay[lesson.offsetDayId]
						setLessonTimeOffset(lesson, 0, studentSettings)
					})
					ModalAlert.close()
				}}
			>
				Сбросить
			</Button>
			<Button
				mode="outlined"
				onPress={() => {
					runInAction(() => {
						const offset = getOffset(lesson.startDate, startTime)
						if (offset) setLessonTimeOffset(lesson, offset, studentSettings)

						if (name !== getSubjectName(lesson)) {
							studentSettings.subjectNamesDay[lesson.offsetDayId] = name
						}
					})
					ModalAlert.close()
				}}
			>
				Сохранить
			</Button>
		</View>
	)
})
function getOffset(startDate: ReadonlyDate, startTime: HoursMinutes) {
	const start = new Date(startDate.getTime())
	start.setHours(startTime.hours)
	start.setMinutes(startTime.minutes)
	return start.getTime() - startDate.getTime()
}

function dateToHoursMinutes(date: ReadonlyDate): HoursMinutes {
	const hours = date.getHours()
	const minutes = date.getMinutes()
	return { hours, minutes }
}
