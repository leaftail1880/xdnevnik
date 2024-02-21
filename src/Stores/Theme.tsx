import {
	DarkTheme as NavigationDarkTheme,
	DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native'
import { makeAutoObservable, runInAction } from 'mobx'
import { Appearance } from 'react-native'
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper'
import type {
	MD3Colors,
	MD3Theme,
} from 'react-native-paper/lib/typescript/types'
import { prepareVariant } from '../Components/createTheme'
import { Logger } from '../Setup/constants'
import { makeReloadPersistable } from './makePersistable'

type ThemeName = 'light' | 'dark'
type SchemeName = ThemeName | 'system'

type PersistentKeys = Record<'scheme' | 'accentColor', string> & {
	accentColors: string[]
	roundness: number
}

export class ThemeStore {
	static defaultAccentColor = '#578059'
	static defaultScheme: ThemeName = 'light'
	static meta(store: ThemeStore) {
		return {
			scheme: store.scheme,
			accentColor: store.accentColor,
			accentColors: store.accentColors,
			theme: store.theme,
			loaded: store.loaded,
			clearAccentColors: store.clearSelectedAccentColors,
		}
	}
	static getDefaultAccentColors() {
		return [this.defaultAccentColor, '#427979', '#3C639C', '#967857', '#926759']
	}

	scheme: SchemeName = ThemeStore.defaultScheme
	accentColor = ThemeStore.defaultAccentColor
	accentColors = ThemeStore.getDefaultAccentColors()
	roundness = 5
	theme = this.generateTheme(false, MD3LightTheme)
	loaded = false

	get key() {
		return this.accentColor + this.theme
	}

	get dark(): boolean {
		return this.theme.dark
	}

	get colors(): MD3Colors {
		return this.theme.colors
	}

	get animation() {
		return this.theme.animation
	}

	get fonts() {
		return this.theme.fonts
	}

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true })
		makeReloadPersistable<PersistentKeys, keyof PersistentKeys>(
			this as unknown as PersistentKeys,
			{
				properties: ['scheme', 'accentColor', 'accentColors', 'roundness'],
				name: 'theme',
			}
		).then(() =>
			runInAction(() => {
				try {
					this.setAccentColor(this.accentColor)
				} catch (e) {
					Logger.error(e)
				}
				this.loaded = true
			})
		)
	}

	private generateTheme(
		dark = this.dark,
		material: MD3Theme,
		colors = material.colors
	) {
		const navigation = dark ? NavigationDarkTheme : NavigationDefaultTheme

		return {
			...navigation,
			...material,
			roundness: this.roundness,
			colors: {
				...navigation.colors,
				...colors,
				primary: colors.primary,
				background: colors.background,
				card: colors.elevation.level2,
				text: colors.onSurface,
				border: colors.outline,
				notification: colors.error,
			},
		}
	}

	setAccentColor(color: string) {
		color = color.slice(0, 7)
		if (!this.accentColors.includes(color)) this.accentColors.push(color)
		this.accentColor = color
		this.setColorScheme(this.scheme)
	}

	clearSelectedAccentColors() {
		this.accentColors = ThemeStore.getDefaultAccentColors()
	}

	setColorScheme(scheme = this.scheme) {
		this.scheme = scheme

		// Define whenether theme is dark or not
		const systemScheme = Appearance.getColorScheme() ?? ThemeStore.defaultScheme
		const toBoolean = { light: false, dark: true }
		const dark = { system: toBoolean[systemScheme], ...toBoolean }[scheme]

		// Generate theme based on accent color
		this.theme = this.generateTheme(
			dark,
			dark ? MD3DarkTheme : MD3LightTheme,
			prepareVariant({
				primary: this.accentColor,
				type: dark ? 'dark' : 'light',
			})
		)
	}
}

export const Theme = new ThemeStore()
