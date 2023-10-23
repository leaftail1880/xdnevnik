import AsyncStorage from '@react-native-async-storage/async-storage'
import { Theme } from '@react-navigation/native'
import { useEffect, useState } from 'react'

interface Settings {
	notifications: boolean
	studentIndex: number
	theme: 'system' | 'dark' | 'light' | Theme
	lastNameLast: boolean
}

export type SettingsCtx = ReturnType<typeof useSettingProvider>

export const DEFAULT_SETTINGS: Settings = {
	notifications: false,
	studentIndex: 0,
	theme: 'system',
	lastNameLast: true
}

export function useSettingProvider() {
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