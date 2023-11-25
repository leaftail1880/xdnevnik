import { Falsy, Text, TextStyle } from 'react-native'
import { styles } from '../constants'
import { Button, ButtonProps } from './Button'

export function Mark({
	finalMark,
	mark: markProp,
	markWeight,
	style,
	textStyle,
	subTextStyle,
	...props
}: ButtonProps & {
	finalMark?: number | null | string
	mark: number | null | string
	markWeight?: { max: number; min: number; current: number } | Falsy
	textStyle?: TextStyle
	subTextStyle?: TextStyle
}) {
	const mark = finalMark ? Number(finalMark) : markProp
	let color: string = '#555555' + (markWeight ? '' : 'FF')
	if (typeof mark === 'number' && !isNaN(mark)) {
		if (mark >= 4.6) {
			color = '#007000'
		} else if (mark >= 3.6) {
			color = '#947900'
		} else if (mark >= 2.6) {
			color = '#8D4B00'
		} else if (mark >= 1.6) {
			color = '#940000'
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

	return (
		<Button
			{...props}
			style={[
				{ padding: 7, margin: 3, borderRadius: 5, backgroundColor: color },
				style,
				finalMark
					? {
							borderWidth: 5,
							borderColor: color,
							borderStyle: 'dotted',
							borderCurve: 'circular',
					  }
					: false,
			]}
		>
			<Text
				style={{
					textAlign: 'center',
					color: styles.buttonText.color,
					...textStyle,
				}}
			>
				{finalMark ?? markProp}
			</Text>
			{markWeight && (
				<Text
					style={{
						fontSize: 10,
						textAlign: 'center',
						color: styles.buttonText.color,
						...subTextStyle,
					}}
				>
					{markWeight.current}
				</Text>
			)}
			{!!finalMark && (
				<Text
					style={{
						fontSize: 10,
						textAlign: 'center',
						color: styles.buttonText.color,
						...subTextStyle,
					}}
				>
					{markProp}
				</Text>
			)}
		</Button>
	)
}
