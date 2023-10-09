import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useState } from 'react'

interface Settings {
	notifications: boolean
	studentIndex: number
}

interface SettingsContext extends Settings {
	save(value: Partial<Settings>): void
}

const DefaultSettings: Settings = {
	notifications: false,
	studentIndex: 0,
}

export const SettingsCtx = createContext<SettingsContext>({
	...DefaultSettings,
	save() {
		throw new Error('Boilerplate')
	},
})

export function setupSettings(): [
	Settings,
	React.FC<{ children: React.ReactNode | undefined }>
] {
	const [settings, setSettings] = useState(DefaultSettings)
	useEffect(() => {
		AsyncStorage.getItem('settings').then(
			raw => raw && setSettings(JSON.parse(raw))
		)
	}, [])

	const save: SettingsContext['save'] = value => {
		const newValue = Object.assign(settings, value)

		setSettings(newValue)
		AsyncStorage.setItem('settings', JSON.stringify(newValue))
	}

	return [
		settings,
		props => (
			<SettingsCtx.Provider
				value={{
					...settings,
					save,
				}}
				children={props.children}
			/>
		),
	]
}

export function useSettings() {
	return useContext(SettingsCtx)
}
