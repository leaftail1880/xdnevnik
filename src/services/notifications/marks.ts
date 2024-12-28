import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from '@notifee/react-native'
import * as BackgroundFetch from 'expo-background-fetch'
import { BackgroundFetchResult } from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { action, autorun, makeAutoObservable, runInAction } from 'mobx'
import { getSubjectName } from '~components/SubjectName'
import { Settings } from '~models/settings'
import { Logger } from '../../constants'
import { API } from '../net-school/api'
import { Assignment } from '../net-school/entities'
import { makeReloadPersistable } from '~utils/makePersistable'

export const MarksNotificationStore = new (class {
	notified: string[] = []
	logs: string[] = []
	marksChannelId = ''

	constructor() {
		makeAutoObservable(
			this,
			{ log: action, clearLogs: action },
			{ autoBind: true },
		)
		makeReloadPersistable(this, {
			name: 'marksNotifications',
			properties: ['notified', 'logs'],
		})
	}

	log(level: 'info' | 'error', ...messages: unknown[]) {
		this.logs.unshift(
			`${level.toUpperCase()}   ${new Date().toReadable().split(' ').reverse().join(' ')}  ${messages.map(e => (e instanceof Error ? e.stack : String(e))).join(' ')}`,
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
	return Settings.marksNotifications && MarksNotificationStore.marksChannelId
}

const TASK_ID = 'background-fetch'

TaskManager.defineTask(TASK_ID, checkForNewMarksAndNotify)

autorun(function registerTask() {
	if (enabled()) {
		MarksNotificationStore.log('info', 'Состояние: Включено')
		BackgroundFetch.registerTaskAsync(TASK_ID, {
			startOnBoot: true,
			stopOnTerminate: false,
		}).catch(onError)
	} else {
		MarksNotificationStore.log('info', 'Состояние: Выключено')
		BackgroundFetch.unregisterTaskAsync(TASK_ID).catch(() => {})
	}
})

function onError(reason: unknown) {
	Logger.debug(`Unregistering task ${TASK_ID} failed:`, reason)
}

export async function checkForNewMarksAndNotify(): Promise<BackgroundFetchResult> {
	MarksNotificationStore.log('info', `Запрос новых оценок...`)

	const { studentId } = Settings
	if (!studentId) return MarksNotificationStore.log('error', 'Не выбран учени')
	if (!enabled())
		return MarksNotificationStore.log(
			'error',
			'Уведомления об оценках выключены',
		)

	try {
		const marks = await API.homework({ studentId, withoutMarks: false })
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
		const id = assignment.assignmentId + ''

		if (!MarksNotificationStore.notified.includes(id)) {
			runInAction(() => MarksNotificationStore.notified.push(id))

			newMarks++
			notifee.displayNotification({
				title: `${assignment.result} - ${getSubjectName(assignment)}, ${assignment.assignmentTypeAbbr}, Веc: ${assignment.weight}`,
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
