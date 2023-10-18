import { Text } from 'react-native'
import { ACCENT_COLOR, SECONDARY_COLOR, STYLES } from '../constants'
import { Button, ButtonProps } from './button'

export function Mark({
	mark,
	markWeight,
	style,
	...props
}: ButtonProps & { mark: number | null | string; markWeight?: number | null }) {
	let color: string = SECONDARY_COLOR
	if (typeof mark !== 'number' || isNaN(mark)) {
		color = SECONDARY_COLOR
	} else if (mark >= 4.6) {
		color = '#2a8700'
	} else if (mark >= 3.6) {
		color = '#C4B000'
	} else if (mark <= 2.6) {
		color = '#D47800'
	} else if (mark && mark <= 1.6) {
		color = '#DB1600'
	}

	if (typeof markWeight === 'number') {
		const transparentPercent = 25 - markWeight //50 - 15 /
		// console.log(
		// 	transparentPercent.toFixed(2),
		// 	transparentPercent.toString(16).toUpperCase().padEnd(2, '0')
		// )
		color += transparentPercent.toString(16).toUpperCase().padEnd(2, '0')
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
					}}
				>
					{markWeight}
				</Text>
			)}
		</Button>
	)
}
