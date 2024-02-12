import { makeAutoObservable, runInAction } from 'mobx'
import { NSEntity } from '../NetSchool/classes'
import { makeReloadPersistable } from './makePersistable'

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
	notifications = true
	studentIndex = 0

	lastNameLast = true
	currentTotalsOnly = true
	currentTerm?: NSEntity = undefined
	markStyle: 'background' | 'border' = 'background'
	/**
	 * Map containing per student overrides
	 */
	studentOverrides: Record<string, StudentOverride | undefined> = {}

	forStudent(
		id: number
	): StudentOverride & { save(value: Partial<StudentOverride>): void } {
		function save(this: StudentOverride, value: Partial<StudentOverride>) {
			Object.assign(this, value)
		}
		const defaultValue = Object.assign(
			{
				subjectNames: {},
				subjects: {},
			} satisfies StudentOverride as StudentOverride,
			{ save }
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
		makeAutoObservable(this, { forStudent: false })

		const clearOverrides = (value: this['studentOverrides']) => {
			for (const override of Object.values(value)) {
				if (override) Reflect.deleteProperty(override, 'save')
			}

			return value
		}

		makeReloadPersistable(this, {
			name: 'settings',
			properties: [
				...(Object.keys(this) as unknown as (keyof this)[]).filter(
					e => typeof this[e] !== 'function' || e === 'studentOverrides'
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
}

export const Settings = new SettingsStore() as Readonly<SettingsStore>

export function fullname(name: string) {
	if (Settings.lastNameLast) {
		const parts = name.split(' ')
		return [parts[1], parts[2], parts[0]].join(' ')
	} else {
		return name
	}
}
