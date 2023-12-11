import { useContext } from 'react'
import { Falsy, TextStyle } from 'react-native'
import { Colors, Text } from 'react-native-ui-lib'
import { Ctx } from '../hooks/settings'
import { ButtonProps, SmallButton } from './Button'

const MarkColorsBG = {
	5: '#007000',
	4: '#947900',
	3: '#8D4B00',
	2: '#940000',
}
const MarkColorsText = {
	5: '#00C500',
	4: '#C7A200',
	3: '#C06600',
	2: '#C00000',
}

export function Mark({
	finalMark,
	mark: markProp,
	markWeight,
	style,
	textStyle,
	subTextStyle,
	duty,
	...props
}: ButtonProps & {
	finalMark?: number | null | string
	mark: number | null | string
	markWeight?: { max: number; min: number; current: number } | Falsy
	duty: boolean
	textStyle?: TextStyle
	subTextStyle?: TextStyle
}) {
	const { settings } = useContext(Ctx)
	const bg = settings.markStyle === 'background'
	const colors = bg ? MarkColorsBG : MarkColorsText

	if (duty) markProp = 2

	const mark = finalMark ? Number(finalMark) : markProp
	let color: string = '#7A7A7A' + (markWeight ? '' : '55')
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

	const FinalMarkStyle: TextStyle = {
		borderWidth: 2,
		borderColor: color,
		borderStyle: 'dotted',
		borderCurve: 'circular',
	}

	const textColor = bg ? Colors.white : color

	return (
		<SmallButton
			br30
			margin-s1
			center
			{...props}
			style={[
				{
					elevation: 0,
				},
				bg
					? { backgroundColor: color }
					: { borderColor: color, borderWidth: 2 },
				finalMark ? FinalMarkStyle : false,
				style,
			]}
		>
			<Text center text60 color={textColor} style={textStyle} margin-0>
				{duty ? '.' : finalMark ?? markProp}
			</Text>
			{markWeight && (
				<Text
					center
					margin-0
					style={{
						fontSize: 10,
						color: textColor,
						...subTextStyle,
					}}
				>
					{markWeight.current}
				</Text>
			)}
			{!!finalMark && (
				<Text
					margin-0
					center
					style={{
						fontSize: 10,
						color: textColor,
						...subTextStyle,
					}}
				>
					{markProp}
				</Text>
			)}
		</SmallButton>
	)
}
