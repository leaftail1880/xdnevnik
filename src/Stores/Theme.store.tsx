import { DarkTheme } from '@react-navigation/native'
import { action, makeAutoObservable, observable } from 'mobx'
import { Appearance } from 'react-native'
import { Colors, Scheme } from 'react-native-ui-lib'
import { ACCENT_COLOR } from '../constants'
import { makeReloadPersistable } from './makePersistable'

// spy(event => {
// 	if (event.type == 'update' && event.debugObjectName.includes('NetSchool')) {
// 		logger.debug(
// 			event.debugObjectName,
// 			'old',
// 			event.newValue,
// 			'new',
// 			event.newValue
// 		)
// 	}
// })

class ThemeStore {
	theme = DarkTheme
	scheme: 'light' | 'dark' | 'system' = 'light'
	accentColor = ACCENT_COLOR

	constructor() {
		makeAutoObservable(this, {
			theme: observable.struct,
			setColorScheme: action,
		})
		makeReloadPersistable(this, {
			properties: ['theme', 'scheme', 'accentColor'],
			name: 'theme',
		})
	}

	setAccentColor(color: string) {
		this.accentColor = color

		Colors.loadDesignTokens({ primaryColor: color })
		Colors.loadSchemes({
			light: {
				$textAccent: '#FFFFFF',
				$backgroundAccent: color,
			},
			dark: {
				$textAccent: '#FFFFFF',
				$backgroundAccent: color,
			},
		})

		this.updateColors()
	}

	setColorScheme(scheme: null | undefined | this['scheme']) {
		if (!scheme || this.scheme === scheme) return

		this.scheme = scheme
		const realScheme: 'light' | 'dark' =
			scheme === 'system' ? Appearance.getColorScheme() ?? 'light' : scheme
		Scheme.setScheme(realScheme)
		this.updateColors()
	}

	updateColors() {
		this.theme.dark = this.scheme === 'dark'
		Object.assign(this.theme.colors, {
			background: Colors.$backgroundDefault,
			border: Colors.$backgroundElevated,
			card: Colors.$backgroundPrimaryLight,
			notification: Colors.$backgroundAccent,
			primary: Colors.$backgroundAccent,
			text: Colors.$textDefault,
		})
	}
}

export const Theme = new ThemeStore()
