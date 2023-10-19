import { Text, TextStyle } from 'react-native'
import { ACCENT_COLOR, SECONDARY_COLOR, STYLES } from '../constants'
import { Button, ButtonProps } from './button'

export function Mark({
	mark,
	markWeight,
	maxWeight,
	style,
	textStyle,
	...props
}: ButtonProps & {
	mark: number | null | string
	markWeight?: number | null
	maxWeight?: number | null
	textStyle?: TextStyle
}) {
	let color: string = SECONDARY_COLOR
	if (typeof mark !== 'number' || isNaN(mark)) {
		color = SECONDARY_COLOR
	} else if (mark >= 4.6) {
		color = '#509B2E'
	} else if (mark >= 3.6) {
		color = '#B4A83B'
	} else if (mark >= 2.6) {
		color = '#D47800'
	} else if (mark >= 1.6) {
		color = '#DB1600'
	}

	const maxAlpha = 16 * 16 - 1
	if (typeof markWeight === 'number' && typeof maxWeight === 'number') {
		const alphaPercent = ~~(maxAlpha - maxWeight / markWeight) //50 - 15
		const alpha = alphaPercent.toString(16).toUpperCase().padStart(2, '0')
		console.log(alphaPercent, alpha)
		color += alpha
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
					color: STYLES.buttonText.color,
					textAlign: 'center',
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
					{markWeight}
				</Text>
			)}
		</Button>
	)
}
