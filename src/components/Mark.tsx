import { observer } from 'mobx-react-lite'
import {
	TextStyle,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from 'react-native'
import { Text } from 'react-native-paper'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'

const MarkColorsBG = {
	5: '#007000',
	4: '#946C00',
	3: '#8D3F00',
	2: '#940000',
}
const MarkColorsText = {
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

export default observer(function Mark({
	finalMark,
	mark: rawMark,
	style,
	textStyle,
	subTextStyle,
	weight,
	maxWeight,
	minWeight,
	duty,
	noColor = '#7A7A7A',
	...props
}: TouchableOpacityProps & {
	finalMark?: number | null | string
	mark: number | null | string
	duty: boolean
	noColor?: string
	textStyle?: TextStyle
	subTextStyle?: TextStyle
} & (Weight | Partial<Weight>)) {
	const bg = Settings.markStyle === 'background'
	const colors = bg ? MarkColorsBG : MarkColorsText

	if (duty) rawMark = 2
	const mark = finalMark ? Number(finalMark) : rawMark
	if (duty) rawMark = '.'

	let color = noColor + (typeof weight === 'number' ? '' : '55')
	if (typeof mark === 'number' && !isNaN(mark)) {
		if (mark >= 4.6) {
			color = colors[5]
		} else if (mark >= 3.6) {
			color = colors[4]
		} else if (mark >= 2.6) {
			color = colors[3]
		} else if (mark >= 1.6) {
			color = colors[2]
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
			<View
				style={{
					padding: 0,
					margin: 0,
					alignContent: 'center',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Text style={[{ color: textColor, fontWeight: 'bold' }, textStyle]}>
					{duty ? '.' : finalMark ?? rawMark}
				</Text>
				{typeof weight === 'number' && (
					<Text style={[{ fontSize: 12, color: textColor }, subTextStyle]}>
						{Settings.showMarkWeightTip ? 'Вес: ' : ''}
						{weight}
					</Text>
				)}
				{!!finalMark && rawMark && (
					<Text
						style={[
							{ alignSelf: 'center', fontSize: 7, color: textColor },
							subTextStyle,
						]}
					>
						Балл: {rawMark}
					</Text>
				)}
			</View>
		</TouchableOpacity>
	)
})