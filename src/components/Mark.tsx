import { XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { observer } from 'mobx-react-lite'
import {
	StyleSheet,
	TextStyle,
	TouchableOpacity,
	TouchableOpacityProps,
} from 'react-native'
import { Badge, Text } from 'react-native-paper'

export const MarkColorsBG = {
	5: '#007000',
	4: '#946C00',
	3: '#8D3F00',
	2: '#940000',
}
export const MarkColorsText = {
	5: '#00C500',
	4: '#C7A200',
	3: '#C06600',
	2: '#C00000',
}

interface Weight {
	maxWeight: number
	minWeight: number
	weight: number | undefined
}

export function roundMark(mark: number, markRoundAdd: number) {
	return Math.round(mark + markRoundAdd)
}

export default observer(function Mark({
	finalMark,
	mark,
	style,
	textStyle,
	subTextStyle,
	weight,
	maxWeight,
	minWeight,
	duty,
	noColor = '#7A7A7A',
	unseen = false,
	...props
}: TouchableOpacityProps & {
	finalMark?: number | null | string
	mark: number | null | undefined | string
	duty: boolean
	noColor?: string
	textStyle?: TextStyle
	subTextStyle?: TextStyle
	unseen?: boolean
} & (Weight | Partial<Weight>)) {
	const {
		bg,
		color,
		textColor,
		rawMark: calculatedMark,
	} = calculateColorsAndMark(
		duty,
		mark,
		finalMark,
		noColor,
		weight,
		minWeight,
		maxWeight,
	)

	return (
		<TouchableOpacity
			{...props}
			style={[
				{
					elevation: 0,
					borderRadius: Theme.roundness,
					alignContent: 'center',
					justifyContent: 'center',
					alignItems: 'center',
				},
				bg
					? { backgroundColor: color }
					: { borderColor: color, borderWidth: 1.5 },
				finalMark
					? {
							borderWidth: 1.5,
							borderColor: bg ? Theme.colors.onSurface : color,
							borderCurve: 'circular',
						}
					: false,
				style,
			]}
		>
			{unseen && <MarkBadge />}
			<Text style={[{ color: textColor, fontWeight: 'bold' }, textStyle]}>
				{duty ? '.' : (finalMark ?? calculatedMark ?? ' ')}
			</Text>
			{typeof weight === 'number' && (
				<Text style={[{ fontSize: 12, color: textColor }, subTextStyle]}>
					{/* {Settings.showMarkWeightTip ? 'Вес: ' : ''} */}
					{weight}
				</Text>
			)}
			{!!finalMark && calculatedMark && (
				<Text
					style={[
						{ alignSelf: 'center', fontSize: 7, color: textColor },
						subTextStyle,
					]}
				>
					Балл: {calculatedMark}
				</Text>
			)}
		</TouchableOpacity>
	)
})

const MarkBadge = observer(function MarkBadge() {
	return (
		<Badge
			style={[
				styles.badge,
				{
					backgroundColor: Theme.dark
						? Theme.colors.errorContainer
						: Theme.colors.error,
				},
			]}
			size={8}
		/>
	)
})

function calculateColorsAndMark(
	duty: boolean,
	rawMark: string | number | null | undefined,
	finalMark: string | number | null | undefined,
	noColor: string,
	weight: number | undefined,
	minWeight: number | undefined,
	maxWeight: number | undefined,
) {
	const bg = XSettings.markStyle === 'background'
	const colors = bg ? MarkColorsBG : MarkColorsText

	if (duty) rawMark = 2
	const mark = finalMark ? Number(finalMark) : rawMark
	if (duty) rawMark = '.'

	let color = noColor + (typeof weight === 'number' ? '' : '7A')
	if (typeof mark === 'number' && !isNaN(mark)) {
		const rounded = roundMark(mark, XSettings.markRoundAdd)
		if (rounded in colors) color = colors[rounded as keyof typeof colors]
		else {
			const keys = Object.keys(colors).map(Number)
			const min = Math.min(...keys)
			const max = Math.max(...keys)

			if (rounded > max) color = colors[max as keyof typeof colors]
			if (rounded < min) color = colors[min as keyof typeof colors]
		}
	}

	const textColor = bg ? 'white' : color

	if (
		typeof weight === 'number' &&
		typeof minWeight === 'number' &&
		typeof maxWeight === 'number'
	) {
		const minAlpha = 100
		const maxAlpha = 16 * 16 - 1 - minAlpha
		const min = minWeight - 1

		const cur = weight - min
		const max = maxWeight - min
		/** 255 / x = max / cur */
		const alphaPercent = minAlpha + ~~((maxAlpha * cur) / max)
		if (alphaPercent > 0) {
			const alpha = alphaPercent.toString(16).toUpperCase().padStart(2, '0')
			color += alpha
		}
	}
	return { bg, color, textColor, rawMark }
}

const styles = StyleSheet.create({
	badge: {
		position: 'absolute',
		top: -2,
		right: -2,
	},
})
