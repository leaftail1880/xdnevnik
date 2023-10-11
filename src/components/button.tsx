import { useState } from 'react'
import { Pressable, PressableProps } from 'react-native'
import { STYLES } from '../constants'

export function Button({
	children,
	onPress,
	style,
}: Pick<PressableProps, 'children' | 'style'> & {
	onPress(): void | Promise<void>
}) {
	const [presssed, setPressed] = useState(false)
	return (
		<Pressable
			onPress={async () => {
				setPressed(true)
				const result = onPress?.()
				if (result) await result
				setTimeout(() => setPressed(false), result ? 0 : 1000)
			}}
			disabled={presssed}
			style={
				typeof style === 'function' || !style
					? style
					: {
							...(typeof style === 'object' && style ? style : {}),
							backgroundColor: presssed
								? STYLES.pressedButton.backgroundColor
								: style && 'backgroundColor' in style
								? style?.backgroundColor
								: STYLES.button.backgroundColor,
					  }
			}
		>
			{children}
		</Pressable>
	)
}
