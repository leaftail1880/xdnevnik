import { makeAutoObservable } from 'mobx'
import { makeReloadPersistable } from './makePersistable'
import { NSEntity } from '../NetSchool/classes'

class SettingsStore {
	notifications = true
	studentIndex = 0

	lastNameLast = true
	currentTotalsOnly = true
	currentTerm?: NSEntity
	markStyle: 'background' | 'border' = 'border'
	/**
	 * Map containing per student overrides
	 */
	studentOverrides: Record<
		string,
		| {
				/**
				 * Map containing subjectIds as keys and overrided subjectName as value
				 */
				subjectNames: Record<string, string | undefined>
				/**
				 * Map containing new information about subject
				 */
				subjects: Record<string, object>
		  }
		| undefined
	> = {}

	constructor() {
		makeAutoObservable(this)
		makeReloadPersistable(this, {
			name: 'settings',
			properties: Object.keys(this).filter(
				e => e !== 'save'
			) as unknown as (keyof this)[],
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
