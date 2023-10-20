import { Falsy, Text, TextStyle } from 'react-native'
import { ACCENT_COLOR, SECONDARY_COLOR, STYLES } from '../constants'
import { Button, ButtonProps } from './button'

export function Mark({
	mark,
	markWeight,
	style,
	textStyle,
	...props
}: ButtonProps & {
	mark: number | null | string
	markWeight?: { max: number; min: number; current: number } | Falsy
	textStyle?: TextStyle
}) {
	let color: string = SECONDARY_COLOR + Math.floor(5).toString(16)
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
			style={
				typeof style === 'object' && style !== null
					? {
							padding: 7,
							margin: 3,
							borderRadius: 5,
							borderColor: ACCENT_COLOR,
							backgroundColor: color,

							...style,
					  }
					: style
			}
		>
			<Text
				style={{
					textAlign: 'center',
					color: STYLES.buttonText.color,
					...textStyle,
				}}
			>
				{mark}
			</Text>
			{markWeight && (
				<Text
					style={{
						fontSize: 10,
						textAlign: 'center',
						color: STYLES.buttonText.color,
						...textStyle,
					}}
				>
					{markWeight.current}
				</Text>
			)}
		</Button>
	)
}
