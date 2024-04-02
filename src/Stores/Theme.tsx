import {
	DarkTheme as NavigationDarkTheme,
	DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native'

import * as NavigationBar from 'expo-navigation-bar'
import * as SystemUI from 'expo-system-ui'

import { captureException } from '@sentry/react-native'
import { makeAutoObservable, runInAction } from 'mobx'
import { Appearance } from 'react-native'
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'
import type { MD3Colors } from 'react-native-paper/lib/typescript/types'
import { Logger } from '../Setup/constants'
import { prepareVariant } from '../utils/createTheme'
import { makeReloadPersistable } from '../utils/makePersistable'

type ThemeName = 'light' | 'dark'
type SchemeName = ThemeName | 'system'

type PersistentKeys = Record<'scheme' | 'accentColor', string> & {
	accentColors: string[]
	roundness: number
}

export class ThemeStore {
	static readonly defaultAccentColor = '#578059'
	static readonly defaultScheme: ThemeName = 'light'
	static meta(store: ThemeStore) {
		return {
			accentColor: store.accentColor,
			accentColors: store.accentColors,
			clearAccentColors: store.clearSelectedAccentColors,
			theme: store.theme,
			loading: store.loading,
			updateColorScheme: store.updateColorScheme,
		}
	}
	static getDefaultAccentColors() {
		return [this.defaultAccentColor, '#427979', '#3C639C', '#967857', '#926759']
	}

	private accentColor = ThemeStore.defaultAccentColor
	private accentColors = ThemeStore.getDefaultAccentColors()
	private theme = this.generateTheme()
	private loading = true

	public scheme: SchemeName = ThemeStore.defaultScheme
	public roundness = 5

	get key() {
		return this.accentColor + this.theme
	}

	get dark(): boolean {
		return this.theme.dark
	}

	get colors(): MD3Colors & { navigationBar: string } {
		return this.theme.colors
	}

	get animation() {
		return this.theme.animation
	}

	get fonts() {
		return this.theme.fonts
	}

	constructor() {
		makeAutoObservable<this, 'isDark'>(
			this,
			{ isDark: false },
			{ autoBind: true }
		)
		makeReloadPersistable<PersistentKeys, keyof PersistentKeys>(
			this as unknown as PersistentKeys,
			{
				properties: ['scheme', 'accentColor', 'accentColors', 'roundness'],
				name: 'theme',
			}
		).then(() =>
			runInAction(() => {
				try {
					this.loading = false
					this.setAccentColor(this.accentColor)
				} catch (e) {
					Logger.error(e)
				}
			})
		)

		Appearance.addChangeListener(this.updateColorScheme)
	}

	private get isDark() {
		return Appearance.getColorScheme() === 'dark'
	}

	setAccentColor(color: string) {
		color = color.slice(0, 7)
		if (!this.accentColors.includes(color)) this.accentColors.push(color)
		this.accentColor = color
		this.updateColorScheme()
	}

	private clearSelectedAccentColors() {
		this.accentColors = ThemeStore.getDefaultAccentColors()
	}

	private updateColorScheme() {
		// Generate theme based on accent color
		this.theme = this.generateTheme()

		NavigationBar.setButtonStyleAsync(this.isDark ? 'light' : 'dark').catch(
			captureException
		)
		NavigationBar.setBackgroundColorAsync(Theme.colors.navigationBar).catch(
			captureException
		)
		NavigationBar.setVisibilityAsync('visible').catch(captureException)
		SystemUI.setBackgroundColorAsync(Theme.colors.background).catch(
			captureException
		)
	}

	private generateTheme() {
		const dark = this.isDark
		const navigation = dark ? NavigationDarkTheme : NavigationDefaultTheme
		const material = dark ? MD3DarkTheme : MD3LightTheme
		const colors = prepareVariant({
			primary: this.accentColor,
			type: dark ? 'dark' : 'light',
		})

		const card = colors.elevation.level2

		return {
			...navigation,
			...material,
			roundness: this.roundness,
			colors: {
				...navigation.colors,
				...colors,
				card,
				navigationBar: card,
				primary: colors.primary,
				background: colors.background,
				text: colors.onSurface,
				border: colors.outline,
				notification: colors.error,
			},
		}
	}
}

export const Theme = new ThemeStore()
