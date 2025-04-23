import { getSubjectName } from '@/components/SubjectName'
import { XSettings } from '@/models/settings'
import { Assignment } from '@/services/net-school/entities'
import { makeReloadPersistable } from '@/utils/makePersistable'
import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from '@notifee/react-native'
import * as BackgroundFetch from 'expo-background-fetch'
import { BackgroundFetchResult } from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { action, autorun, makeAutoObservable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { Logger } from '../../constants'
import { API } from '../net-school/api'

export interface StudentMarksStorage {
	seen: (number | string)[]
	forceNotSeen: (number | string)[]
}

export const MarksNotificationStore = new (class {
	notified: string[] = []
	students: Record<number, StudentMarksStorage | undefined> = {}
	logs: string[] = []
	marksChannelId = ''

	constructor() {
		makeAutoObservable(
			this,
			{ log: action, clearLogs: action, getStudent: false, isUnseen: false },
			{ autoBind: true },
		)
		makeReloadPersistable(this, {
			name: 'marksNotifications',
			properties: ['notified', 'logs', 'students'],
		})
	}

	getStudent(studentId: number) {
		const defaultValue: StudentMarksStorage = {
			seen: [],
			forceNotSeen: [],
		}

		const value = this.students[studentId]
		if (!value) {
			runInAction(() => {
				this.students[studentId] = defaultValue
			})
			return this.students[studentId] as StudentMarksStorage
		} else {
			runInAction(() => {
				for (const [key, v] of Object.entries(defaultValue)) {
					value[key as keyof StudentMarksStorage] ??= v
				}
			})
			return value
		}
	}

	isUnseen(studentId: number, assignmentId: number | string | undefined) {
		if (typeof assignmentId === 'undefined') return false

		const student = this.getStudent(studentId)
		if (student.forceNotSeen.includes(assignmentId)) return true

		return !student.seen.includes(assignmentId)
	}

	log(level: 'info' | 'error', ...messages: unknown[]) {
		this.logs.unshift(
			`${level.toUpperCase()}   ${new Date()
				.toReadable()
				.split(' ')
				.reverse()
				.join(' ')}  ${messages
				.map(e => (e instanceof Error ? e.stack : String(e)))
				.join(' ')}`,
		)
		Logger[level]('[BACKGROUND MARKS NOTIFICATIONS FETCH]', ...messages)
		if (this.logs.length >= 100) this.logs.pop()
		return level === 'error'
			? BackgroundFetchResult.Failed
			: BackgroundFetchResult.NoData
	}

	clearLogs() {
		this.logs = []
	}
})()

export async function setupMarksChannel() {
	const marksChannelId = await notifee.createChannel({
		id: 'marks',
		name: 'Новые оценки',
		importance: AndroidImportance.DEFAULT,
		visibility: AndroidVisibility.PUBLIC,
		description: 'Уведомления о новых оценках',
	})

	runInAction(() => (MarksNotificationStore.marksChannelId = marksChannelId))
}

function enabled() {
	return XSettings.marksNotifications && MarksNotificationStore.marksChannelId
}

const TASK_ID = 'background-fetch'

if (Platform.OS !== 'ios') {
	TaskManager.defineTask(TASK_ID, () =>
		checkForNewMarksAndNotify('Фоновый запрос: '),
	)

	let interval: ReturnType<typeof setTimeout>

	autorun(function registerTask() {
		if (enabled()) {
			MarksNotificationStore.log('info', 'Состояние: Включено')
			BackgroundFetch.registerTaskAsync(TASK_ID, {
				startOnBoot: true,
				stopOnTerminate: false,
			}).catch(onError)
			interval = setInterval(
				() => checkForNewMarksAndNotify('Активное приложение'),
				1000 * 60, // minute
			)
		} else {
			MarksNotificationStore.log('info', 'Состояние: Выключено')
			BackgroundFetch.unregisterTaskAsync(TASK_ID).catch(() => {})
			clearInterval(interval)
		}
	})
}

function onError(reason: unknown) {
	Logger.debug(`Unregistering task ${TASK_ID} failed:`, reason)
}

export async function checkForNewMarksAndNotify(
	text = 'Фоновый запрос',
): Promise<BackgroundFetchResult> {
	MarksNotificationStore.log('info', `${text}: Запрос новых оценок...`)

	const { studentId } = XSettings
	if (!studentId) return MarksNotificationStore.log('error', 'Не выбран учени')
	if (!enabled())
		return MarksNotificationStore.log(
			'error',
			'Уведомления об оценках выключены',
		)

	try {
		const marks = await API.homework({
			studentId,
			withoutMarks: false,
			withExpiredClassAssign: true,
		})
		const newMarks = checkForNewMarks(marks)
		MarksNotificationStore.log(
			'info',
			`Успешно! ${newMarks ? `Новых оценок: ${newMarks}` : 'Новых оценок нет'}`,
		)

		return newMarks
			? BackgroundFetchResult.NewData
			: BackgroundFetchResult.NoData
	} catch (e) {
		return MarksNotificationStore.log('error', 'Unable to fetch:', e)
	}
}

function checkForNewMarks(marks: Assignment[]) {
	let newMarks = 0

	for (const assignment of marks.filter(e => typeof e.result === 'number')) {
		const oldId = assignment.assignmentId + ''
		const newId = `${assignment.result} -  ${getSubjectName(assignment)}, ${
			assignment.assignmentTypeAbbr
		} ${assignment.assignmentId}`
		const superNewId = `${newId} ${XSettings.studentId}`

		if (
			!MarksNotificationStore.notified.includes(oldId) &&
			!MarksNotificationStore.notified.includes(newId) &&
			!MarksNotificationStore.notified.includes(superNewId)
		) {
			runInAction(() => MarksNotificationStore.notified.push(newId))

			MarksNotificationStore.log('info', newId)

			newMarks++
			notifee.displayNotification({
				title: `${assignment.result} - ${getSubjectName(assignment)}, ${
					assignment.assignmentTypeAbbr
				}, Веc: ${assignment.weight}`,
				body: `${assignment.assignmentName}`,
				android: {
					channelId: MarksNotificationStore.marksChannelId,
					smallIcon: 'notification_icon',
					pressAction: { id: 'default' },
				},
			})
		}
	}

	return newMarks
}
