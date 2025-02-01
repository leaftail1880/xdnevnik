import { autorun, makeAutoObservable } from 'mobx'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import {
	AssignmentsStore,
	AttachmentsStore,
	DiaryStore,
} from '~services/net-school/store'
import { Spacings } from '~utils/Spacings'
import { LANG, styles } from '../../constants'
import { makeReloadPersistable } from '../../utils/makePersistable'

const second = 1000
const minute = second * 60
const hour = minute * 60
const day = hour * 24

export const DiaryState = new (class {
	constructor() {
		makeAutoObservable<this, 'weekOffset'>(this, {
			weekOffset: false,
		})
		makeReloadPersistable(this, {
			name: 'diary',
			properties: ['showHomework', 'showAttachments', 'showLessonTheme'],
		})
	}

	day = new Date().toYYYYMMDD()
	week = new Date()

	showHomework = true
	showAttachments = true
	showLessonTheme = true

	edit = false

	get weekDays() {
		return Date.week(this.week)
	}
	private weekOffset(daysOffset: number) {
		return new Date(this.week.getTime() + daysOffset * day)
	}
	get weekBefore() {
		return this.weekOffset(-7)
	}
	get weekAfter() {
		return this.weekOffset(7)
	}
	get weekDaysDropdown() {
		const today = new Date()
		const todayWeek = Date.week(today)
		const todayString = today.toYYYYMMDD()
		return [
			this.weekDays[0].toYYYYMMDD() === todayWeek[0].toYYYYMMDD()
				? null
				: {
						label: <DayRenderer day={today} i={0} />,
						value: todayString + '$TODAY', // Just so no same warning keys warning is thrown
						week: todayWeek[0],
					},
			weekValue('Прошлая неделя', this.weekBefore),
			...this.weekDays.map((day, i) => ({
				label: <DayRenderer day={day} i={i} />,
				value: day.toYYYYMMDD(),
			})),
			weekValue('Следующая неделя', this.weekAfter),
		].filter(e => !!e)
	}
})()

autorun(() => {
	const { studentId } = Settings
	const { showHomework, weekDays } = DiaryState

	DiaryStore.withParams({
		studentId,
		startDate: weekDays[0].toNetSchool(),
		endDate: weekDays[6].toNetSchool(),
	})

	AssignmentsStore.withParams({
		studentId,
		classmeetingsIds: showHomework
			? DiaryStore.result?.lessons.map(e => e.classmeetingId)
			: undefined,
	})

	const withAttachments = AssignmentsStore.result
		?.filter(e => e.attachmentsExists)
		.map(e => e.assignmentId)

	AttachmentsStore.withParams({
		studentId,
		assignmentIds: withAttachments?.length ? withAttachments : undefined,
	})
})

function weekValue(text: string, week: Date) {
	const day = Date.week(week)[0].toYYYYMMDD()
	return {
		label: `${text} (${day})`,
		value: day,
		week: week,
	}
}

// eslint-disable-next-line mobx/missing-observer
function DayRenderer({ day, i }: { day: Date; i: number }) {
	const today = new Date().toYYYYMMDD() === day.toYYYYMMDD()
	const dayName = LANG.days[i]
	return today ? (
		<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
			{dayName}, cегодня
		</Text>
	) : (
		<View
			style={[
				{
					margin: Spacings.s1,
					width: '90%',
					flex: 1,
				},
				styles.stretch,
			]}
		>
			<Text style={{ fontWeight: 'bold' }}>{dayName}</Text>
			<Text>
				{'  '}
				{day.toYYYYMMDD()}
			</Text>
		</View>
	)
}