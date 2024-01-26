import { DarkTheme } from '@react-navigation/native'
import { action, makeAutoObservable, observable, runInAction } from 'mobx'
import { Appearance } from 'react-native'
import { Colors, Scheme } from 'react-native-ui-lib'
import { ACCENT_COLOR } from '../Setup/constants'
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
	loaded = false

	constructor() {
		makeAutoObservable(this, {
			theme: observable.struct,
			setColorScheme: action,
		})
		makeReloadPersistable(this, {
			properties: ['theme', 'scheme', 'accentColor'],
			name: 'theme',
		}).then(() => {
			runInAction(() => {
				this.setAccentColor(this.accentColor, true)
				this.setColorScheme(this.scheme, true)
				this.loaded = true
			})
		})
	}

	setAccentColor(color: string, force = false) {
		if (color === Colors.$backgroundAccent && !force) return
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

	setColorScheme(scheme: null | undefined | this['scheme'], force = false) {
		if (!scheme) return
		if (!force && this.scheme === scheme) return

		this.scheme = scheme
		const systemScheme = Appearance.getColorScheme() ?? 'light'
		const realScheme =
			scheme === 'system' ? systemScheme : (scheme as 'light' | 'dark')

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
