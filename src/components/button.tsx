import { useState } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

export type ButtonProps = Pick<
	TouchableOpacityProps,
	'children' | 'style' | 'activeOpacity'
> & {
	onPress?(): void | Promise<void>
}

export function Button({ children, onPress, style, activeOpacity }: ButtonProps) {
	const [presssed, setPressed] = useState(false)
	return (
		<TouchableOpacity
			activeOpacity={activeOpacity}
			onPress={async () => {
				setPressed(true)
				const result = onPress?.()
				if (result) {
					await result
					setPressed(false)
				} else setTimeout(() => setPressed(false), 1000)
			}}
			disabled={presssed}
			style={style}
		>
			{children}
		</TouchableOpacity>
	)
}
