import {
	argbFromHex,
	themeFromSourceColor,
} from '@material/material-color-utilities'
import camelCase from 'camelcase'
import Color from 'color'
import {
	MD3Colors,
	MD3ElevationColors,
} from 'react-native-paper/lib/typescript/types'

type ARGBTheme = ReturnType<typeof argbThemeFromColor>
type RGBTheme = Record<keyof ARGBTheme, string>

type RGBColorList = {
	primary: string
	secondary?: string
	tertiary?: string
	custom?: [string, string][]
}

type CustomTheme = RGBColorList & { type: 'light' | 'dark' }

const opacity = {
	level1: 0.08,
	level2: 0.12,
	level3: 0.16,
	level4: 0.38,
}

const elevationLevels = [0.05, 0.08, 0.11, 0.12, 0.14]

function argbThemeFromColor(color: string, type: 'light' | 'dark' = 'light') {
	return themeFromSourceColor(argbFromHex(color)).schemes[type].toJSON()
}

function argbThemeToRgbTheme(theme: ARGBTheme) {
	return Object.fromEntries(
		Object.entries(theme).map(([key, value]) => [
			key,
			Color(value).rgb().string(),
		])
	) as RGBTheme
}

const prepareSurfaceColors = (argbTheme: ARGBTheme) => {
	const { palettes } = themeFromSourceColor(argbTheme.primary)

	const surfaceDisabled = Color(argbTheme.onSurface)
		.alpha(opacity.level2)
		.rgb()
		.string()

	const onSurfaceDisabled = Color(argbTheme.onSurface)
		.alpha(opacity.level4)
		.rgb()
		.string()

	const backdrop = Color(palettes.neutralVariant.tone(20))
		.alpha(0.4)
		.rgb()
		.string()

	return {
		surfaceDisabled,
		onSurfaceDisabled,
		backdrop,
	}
}

const prepareElevations = (argbTheme: ARGBTheme): MD3ElevationColors => {
	const elevations: Partial<MD3ElevationColors> = {
		level0: 'transparent',
	}

	const { primary, surface } = argbTheme

	for (let i = 0; i < elevationLevels.length; i++) {
		// @ts-expect-error Literal
		elevations[`level${i + 1}`] = Color(surface)
			.mix(Color(primary), Number(elevationLevels[i]))
			.rgb()
			.string()
	}

	return elevations as MD3ElevationColors
}

export function getMatchingColor(colorName: keyof MD3Colors, theme: MD3Colors) {
	if (colorName === 'outline') {
		return theme.surface
	}

	if (colorName.startsWith('on')) {
		const key = camelCase(colorName.slice(2))
		return theme[key as keyof MD3Colors]
	}

	const key = `on${camelCase(colorName, { pascalCase: true })}`
	return theme[key as keyof MD3Colors]
}

function prepareCustomColors(
	type: 'light' | 'dark',
	custom?: [string, string][]
) {
	if (!custom?.length) {
		return {}
	}

	const customColors: Record<string, string> = {}

	for (const [name, value] of custom) {
		if (name) {
			const customColor = argbThemeToRgbTheme(argbThemeFromColor(value, type))
			const camelName = camelCase(name)
			const PascalName = camelCase(name, { pascalCase: true })

			customColors[camelName] = customColor.primary
			customColors[`on${PascalName}`] = customColor.onPrimary
			customColors[`${camelName}Container`] = customColor.primaryContainer
			customColors[`on${PascalName}Container`] = customColor.onPrimaryContainer
		}
	}

	return customColors
}

export function prepareVariant({
	primary,
	secondary,
	tertiary,
	type,
	custom,
}: CustomTheme) {
	const baseTheme = argbThemeFromColor(primary, type)

	if (secondary) {
		const secondaryTheme = argbThemeFromColor(secondary, type)
		baseTheme.secondary = secondaryTheme.primary
		baseTheme.onSecondary = secondaryTheme.onPrimary
		baseTheme.secondaryContainer = secondaryTheme.primaryContainer
		baseTheme.onSecondaryContainer = secondaryTheme.onPrimaryContainer
	}

	if (tertiary) {
		const tertiaryTheme = argbThemeFromColor(tertiary, type)
		baseTheme.tertiary = tertiaryTheme.primary
		baseTheme.onTertiary = tertiaryTheme.onPrimary
		baseTheme.tertiaryContainer = tertiaryTheme.primaryContainer
		baseTheme.onTertiaryContainer = tertiaryTheme.onPrimaryContainer
	}

	const theme = argbThemeToRgbTheme(baseTheme)
	const elevation = prepareElevations(baseTheme)
	const surfaceColors = prepareSurfaceColors(baseTheme)
	const customColors = prepareCustomColors(type, custom)

	return {
		...theme,
		elevation,
		...surfaceColors,
		...customColors,
	}
}
