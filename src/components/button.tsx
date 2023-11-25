import { useState } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native-ui-lib'

export type ButtonProps = TouchableOpacityProps & {
	onPress?(props: TouchableOpacityProps): Promise<void> | void
}

export function Button({ onPress, ...props }: ButtonProps) {
	const [presssed, setPressed] = useState(false)
	return (
		<TouchableOpacity
			{...props}
			onPress={async () => {
				setPressed(true)
				const result = onPress?.(props) as void | undefined | Promise<void>
				if (typeof result === 'object' && result instanceof Promise) {
					await result
					setPressed(false)
				} else setTimeout(() => setPressed(false), 500)
			}}
			disabled={presssed}
		/>
	)
}
