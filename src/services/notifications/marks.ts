import notifee, {
	AndroidImportance,
	AndroidVisibility,
} from '@notifee/react-native'
import {
	BackgroundFetchResult,
	registerTaskAsync,
	unregisterTaskAsync,
} from 'expo-background-fetch'
import * as TaskManager from 'expo-task-manager'
import { autorun, makeAutoObservable, runInAction } from 'mobx'
import { makePersistable } from 'mobx-persist-store'
import { getSubjectName } from '~components/SubjectName'
import { Settings } from '~models/settings'
import { Logger } from '../../constants'
import { API } from '../net-school/api'
import { Assignment } from '../net-school/entities'

const NotificationStore = new (class {
	notified: string[] = []
	marksChannelId = ''

	constructor() {
		makeAutoObservable(this)
		makePersistable(this, {
			name: 'marksNotifications',
			properties: ['notified'],
		})
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

	runInAction(() => {
		NotificationStore.marksChannelId = marksChannelId
	})
}

function enabled() {
	return Settings.marksNotifications && NotificationStore.marksChannelId
}

const TASK_ID = 'background-fetch'

// Register task in general
TaskManager.defineTask(TASK_ID, backgroundFetchTask)

// Register task for background fetch interval
autorun(function registerMarksFetchInterval() {
	if (enabled()) {
		registerTaskAsync(TASK_ID, { startOnBoot: true, stopOnTerminate: false })
	} else {
		unregisterTaskAsync(TASK_ID).catch(() =>
			Logger.debug(`Unregistering task ${TASK_ID} failed`),
		)
	}
})

async function backgroundFetchTask() {
	Logger.debug(
		`Got background fetch new marks call at: ${new Date().toReadable()}`,
	)

	if (!Settings.studentId)
		return Logger.debug('No student id for fetch bg call')

	if (!enabled()) {
		return Logger.debug('Bg fetch disabled')
	}

	try {
		const marks = await API.homework({
			studentId: Settings.studentId!,
			withoutMarks: false,
		})

		const newMarks = checkForNewMarks(marks)

		return newMarks
			? BackgroundFetchResult.NewData
			: BackgroundFetchResult.NoData
	} catch (e) {
		return BackgroundFetchResult.Failed
	}
}

function checkForNewMarks(marks: Assignment[]) {
	let newMarks = false

	for (const assignment of marks.filter(e => typeof e.result === 'number')) {
		if (!NotificationStore.notified.includes(assignment.assignmentId + '')) {
			runInAction(() => {
				NotificationStore.notified.push(assignment.assignmentId + '')
				newMarks = true
			})

			notifee.displayNotification({
				title: `${assignment.result} - ${getSubjectName(assignment)}, ${assignment.assignmentTypeAbbr}, Веc: ${assignment.weight}`,
				body: `${assignment.assignmentName}`,
				android: {
					channelId: NotificationStore.marksChannelId,
					smallIcon: 'notification_icon',
					pressAction: {
						id: 'default',
					},
				},
			})
		}
	}

	return newMarks
}
