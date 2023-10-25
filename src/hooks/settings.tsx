import AsyncStorage from '@react-native-async-storage/async-storage'
import { Theme } from '@react-navigation/native'
import { createContext, useEffect, useState } from 'react'
import { Student } from '../NetSchool/classes'
import { Loading } from '../components/loading'
import { APIState } from './api'

interface Settings {
	notifications: boolean
	studentIndex: number
	theme: 'system' | 'dark' | 'light' | Theme
	lastNameLast: boolean
}

export const DEFAULT_SETTINGS: Settings = {
	notifications: false,
	studentIndex: 0,
	theme: 'system',
	lastNameLast: true,
}

export function useSetupSettings() {
	const [settings, setSettings] = useState(DEFAULT_SETTINGS)
	useEffect(() => {
		AsyncStorage.getItem('settings').then(
			raw => raw && setSettings(JSON.parse(raw))
		)
	}, [])

	const save = (value: Partial<Settings>) => {
		const newValue = Object.assign({}, settings, value)

		setSettings(newValue)
		AsyncStorage.setItem('settings', JSON.stringify(newValue))
	}

	return { ...settings, save }
}

export type SettingsCtx = ReturnType<typeof useSetupSettings>

export const APP_CTX = createContext<{
	students: APIState<Student[]>
	settings: SettingsCtx
	studentId?: number
}>({
	students: {
		result: undefined,
		updateDate: undefined,
		fallback: <Loading key={Date.now()} />,
	},
	settings: {
		...DEFAULT_SETTINGS,
		save() {},
	},
})
