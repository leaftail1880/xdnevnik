import { isObservable, makeAutoObservable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { Logger } from '~constants'
import { NSEntity } from '~services/net-school/entities'
import { StudentsStore } from '~services/net-school/store'
import { makeReloadPersistable } from '../utils/makePersistable'

export interface StudentSettings {
	/**
	 * Map containing subjectIds as keys and overrided subjectName as value
	 */
	subjectNames: Record<string, string | undefined>
	/**
	 * Map containing new information about subject
	 */
	subjects: Record<string, object>

	/**
	 * Current term of the student
	 */
	currentTerm?: NSEntity

	targetMark?: number
	defaultMark?: number
	defaultMarkWeight?: number
}

export type StudentSettingsWithSave = ReturnType<SettingsStore['forStudent']>

class SettingsStore {
	studentIndex = 0

	notificationsEnabled = Platform.select({
		android: true,

		default: false,
	})

	lessonNotifications = true
	marksNotifications = true

	nameFormat: 'fio' | 'ifo' = 'ifo'
	currentTotalsOnly = false
	markStyle: 'background' | 'border' = 'background'
	showMarkWeightTip = true
	collapseLongAssignmentText = false
	targetMarkCompact = false

	/**
	 * Map containing per student overrides
	 */
	studentOverrides: Record<string, StudentSettings | undefined> = {}

	get studentId() {
		const student =
			StudentsStore.result && StudentsStore.result[Settings.studentIndex]
		if (student) return student.studentId
	}

	forStudent(id: number) {
		const overrides = this.studentOverrides[id]

		if (overrides) {
			return overrides
		} else {
			const defaultValue: StudentSettings = {
				subjectNames: {},
				subjects: {},
			}
			runInAction(() => (this.studentOverrides[id] = defaultValue))

			const overrides = this.studentOverrides[id]
			if (overrides) {
				return overrides
			} else {
				Logger.warn(new Error('Overrides are UNDEFINED.'))
				return defaultValue
			}
		}
	}

	get studentSettings() {
		if (!this.studentId) return

		return this.forStudent(this.studentId)
	}

	constructor() {
		makeAutoObservable(this, {
			forStudent: false,
			studentSettings: false,
			fullname: false,
			studentId: false,
		})

		const clearOverrides = (value: this['studentOverrides']) => {
			runInAction(() => {
				for (const override of Object.values(value)) {
					if (override) Reflect.deleteProperty(override, 'save')
				}
			})

			return value
		}

		makeReloadPersistable(this, {
			name: 'settings',
			properties: [
				...(Object.keys(this) as unknown as (keyof this)[]).filter(
					e => typeof this[e] !== 'function' && e !== 'studentOverrides',
				),
				{
					key: 'studentOverrides',
					deserialize: clearOverrides,
					serialize: clearOverrides,
				},
			],
		})
	}

	save(value: Partial<Omit<this, 'save'>>) {
		Object.assign(this, value)
	}

	fullname(name: string) {
		if (this.nameFormat === 'ifo') {
			const parts = name.split(' ')
			return [parts[1], parts[2], parts[0]].join(' ')
		} else {
			return name
		}
	}
}

export const Settings = new SettingsStore() as Readonly<SettingsStore>

export function changeSettings<T extends object>(
	settings: T,
	toChange: Partial<T>,
) {
	if (!isObservable(settings)) Logger.warn(new Error('Non-observable settings'))
	runInAction(() => {
		Object.assign(settings, toChange)
	})
}
