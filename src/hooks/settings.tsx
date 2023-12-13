import AsyncStorage from '@react-native-async-storage/async-storage'
import { Theme } from '@react-navigation/native'
import { createContext, useEffect, useState } from 'react'
import { RefreshControl } from 'react-native-gesture-handler'
import { Student } from '../NetSchool/classes'
import { Loading } from '../components/Loading'
import { ACCENT_COLOR } from '../constants'
import { APIState } from './api'

interface Settings extends JSONLike {
	notifications: boolean
	studentIndex: number
	theme: 'system' | 'dark' | 'light'
	themeColors?: Theme['colors']
	lastNameLast: boolean
	currentTotalsOnly: boolean
	selectedTerm?: number
	markStyle: 'background' | 'border'
	accentColor: string
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
	>
}

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] | undefined
}

export const DEFAULT_SETTINGS: Settings = {
	notifications: false,
	studentIndex: 0,
	theme: 'system',
	lastNameLast: true,
	markStyle: 'border',
	accentColor: ACCENT_COLOR,
	currentTotalsOnly: true,
	studentOverrides: {},
}

export function useSetupSettings() {
	const [settings, setSettings] = useState(DEFAULT_SETTINGS)
	useEffect(() => {
		AsyncStorage.getItem('settings').then(
			raw =>
				raw &&
				setSettings(
					setDefaults(JSON.parse(raw), DEFAULT_SETTINGS)
				)
		)
	}, [])

	const save = (value: DeepPartial<Settings>) => {
		const newValue = Object.assign(
			{},
			setDefaults(value, settings)
		)

		setSettings(newValue as Settings)
		AsyncStorage.setItem(
			'settings',
			JSON.stringify(
				removeDefaults(
					newValue,
					DEFAULT_SETTINGS
				)
			)
		)
	}

	return { ...settings, save }
}

export type SettingsCtx = ReturnType<typeof useSetupSettings>

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Ctx = createContext<{
	students: APIState<Student[]>
	settings: SettingsCtx
	studentId?: number
	setStatus: (
		status: { content: React.ReactNode; error: boolean } | undefined
	) => void
}>({
	students: {
		result: undefined,
		updateDate: undefined,
		fallback: <Loading key={Date.now()} />,
		reload: () => void 0,
		refreshControl: <RefreshControl refreshing={true} />,
	},
	settings: {
		...DEFAULT_SETTINGS,
		save() {},
	},
	setStatus: () => void 0,
})

function setDefaults<O extends JSONLike, D extends JSONLike>(
	sourceObject: O,
	defaultObject: D
): O & D {
	if (Array.isArray(sourceObject)) return sourceObject as unknown as O & D

	// Create a new object to avoid modifying the original object
	const COMPOSED: JSONLike = {}

	// Copy properties from the defaults object
	for (const key in defaultObject) {
		const value = sourceObject[key]
		const defaultValue = defaultObject[key]

		if (typeof defaultValue === 'object' && defaultValue !== null) {
			// Value is Object or array, recurse...

			if (Array.isArray(defaultValue)) {
				if (typeof value !== 'undefined' && Array.isArray(value)) {
					COMPOSED[key] = [...value]
				} else {
					COMPOSED[key] = [...defaultValue]
				}
			} else {
				if (key in sourceObject) {
					COMPOSED[key] = setDefaults(
						value as unknown as JSONLike,
						defaultValue as unknown as JSONLike
					)
				} else {
					// If the original object doesn't have the property, add default value
					// And unlink properties...
					COMPOSED[key] = setDefaults({}, defaultValue as unknown as JSONLike)
				}
			}
		} else {
			// Primitive value, assign
			COMPOSED[key] = typeof value === 'undefined' ? defaultValue : value
		}
	}

	// Copy properties from the original object
	for (const key in sourceObject) {
		// If the property is not in the result object, copy it from the original object
		if (!(key in COMPOSED)) {
			COMPOSED[key] = sourceObject[key]
		}
	}

	return COMPOSED as unknown as O & D
}

function removeDefaults<S extends JSONLike>(
	sourceObject: S,
	defaultObject: JSONLike
): S {
	// Create a new object to avoid modifying the original object
	const COMPOSED: JSONLike = {}

	for (const key in sourceObject) {
		const value = sourceObject[key]
		const defaultValue = defaultObject[key]

		if (value === defaultValue) continue

		if (
			typeof defaultValue === 'object' &&
			defaultValue !== null &&
			typeof value === 'object'
		) {
			if (Array.isArray(defaultValue)) {
				//
				if (
					(Array.isArray(value) && value.length) ||
					defaultValue.every((v, i) => v === defaultValue[i])
				)
					continue

				COMPOSED[key] = value
			} else {
				//
				const composedSubObject = removeDefaults(
					value as unknown as JSONLike,
					defaultValue as unknown as JSONLike
				)
				if (Object.keys(composedSubObject).length < 1) continue

				COMPOSED[key] = composedSubObject
			}
		} else {
			// Primitive value, assign
			COMPOSED[key] = value
		}
	}

	return COMPOSED as unknown as S
}