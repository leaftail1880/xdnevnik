import { observer } from 'mobx-react-lite'
import { Falsy, TextStyle, TouchableOpacityProps, View } from 'react-native'
import { Text, TouchableRipple } from 'react-native-paper'
import { Settings } from '../Stores/Settings'
import { Theme } from '../Stores/Theme'

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

export default observer(function Mark({
	finalMark,
	mark: markProp,
	markWeight,
	style,
	textStyle,
	subTextStyle,
	duty,
	noColor = '#7A7A7A',
	...props
}: TouchableOpacityProps & {
	finalMark?: number | null | string
	mark: number | null | string
	markWeight?: { max: number; min: number; current: number } | Falsy
	duty: boolean
	noColor?: string
	textStyle?: TextStyle
	subTextStyle?: TextStyle
}) {
	const bg = Settings.markStyle === 'background'
	const colors = bg ? MarkColorsBG : MarkColorsText

	if (duty) markProp = 2
	const mark = finalMark ? Number(finalMark) : markProp
	if (duty) markProp = '.'

	let color: string = noColor + (markWeight ? '' : '55')
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

	if (markWeight) {
		const minAlpha = 100
		const maxAlpha = 16 * 16 - 1 - minAlpha
		const min = markWeight.min - 1

		const cur = markWeight.current - min
		const max = markWeight.max - min
		/** 255 / x = max / cur */
		const alphaPercent = minAlpha + ~~((maxAlpha * cur) / max)
		if (alphaPercent > 0) {
			const alpha = alphaPercent.toString(16).toUpperCase().padStart(2, '0')
			color += alpha
		}
	}

	return (
		<TouchableRipple
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
					{duty ? '.' : finalMark ?? markProp}
				</Text>
				{markWeight && (
					<Text
						style={[
							{
								fontSize: 12,
								color: textColor,
							},
							subTextStyle,
						]}
					>
						{Settings.showMarkWeightTip ? 'Вес: ' : ''}
						{markWeight.current}
					</Text>
				)}
				{!!finalMark && markProp && (
					<Text
						style={[
							{
								alignSelf: 'center',
								fontSize: 7,
								color: textColor,
							},
							subTextStyle,
						]}
					>
						Балл: {markProp}
					</Text>
				)}
			</View>
		</TouchableRipple>
	)
})
