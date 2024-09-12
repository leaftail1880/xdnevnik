import { makeAutoObservable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { NSEntity } from '~services/net-school/entities'
import { StudentsStore } from '~services/net-school/store'
import { makeReloadPersistable } from '../utils/makePersistable'

type StudentOverride = {
	/**
	 * Map containing subjectIds as keys and overrided subjectName as value
	 */
	subjectNames: Record<string, string | undefined>
	/**
	 * Map containing new information about subject
	 */
	subjects: Record<string, object>
}

class SettingsStore {
	studentIndex = 0

	notificationsEnabled =
		Platform.select({
			ios: false,
			macos: false,
			windows: false,
		}) ?? true

	lessonNotifications = true
	marksNotifications = true

	nameFormat: 'fio' | 'ifo' = 'ifo'
	currentTotalsOnly = false
	currentTerm?: NSEntity = undefined
	markStyle: 'background' | 'border' = 'background'
	requestTimeout = 3
	showMarkWeightTip: boolean = true

	/**
	 * Map containing per student overrides
	 */
	studentOverrides: Record<string, StudentOverride | undefined> = {}

	get studentId() {
		const student =
			StudentsStore.result && StudentsStore.result[Settings.studentIndex]
		if (student) return student.studentId
	}

	forStudent(id: number) {
		const defaultValue = Object.assign(
			{
				subjectNames: {},
				subjects: {},
			} satisfies StudentOverride as StudentOverride,
			{
				save(value: Partial<StudentOverride>) {
					runInAction(() => {
						Object.assign(this, value)
					})
				},
			},
		)

		const overrides = this.studentOverrides[id]
		if (overrides) {
			return { ...defaultValue, ...overrides }
		} else {
			runInAction(() => {
				this.studentOverrides[id] = defaultValue
			})
			return defaultValue
		}
	}

	constructor() {
		makeAutoObservable(this, {
			forStudent: false,
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
