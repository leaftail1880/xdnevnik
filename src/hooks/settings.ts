import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'

interface Settings {
	notifications: boolean
	studentIndex: number
}

export type SettingsCtx = ReturnType<typeof useSettingProvider>

export const DEFAULT_SETTINGS: Settings = {
	notifications: false,
	studentIndex: 0,
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