import { useState } from 'react'
import {
	BorderRadiuses,
	Colors,
	Spacings,
	type TouchableOpacityProps,
} from 'react-native-ui-lib'
import TouchableOpacity from 'react-native-ui-lib/touchableOpacity'
import { Ionicon } from './Icon'

export type ButtonProps = TouchableOpacityProps & {
	onPress?(props: TouchableOpacityProps): Promise<void> | void
}

// eslint-disable-next-line mobx/missing-observer
export const SmallButton = function SmallButton({
	onPress,
	...props
}: ButtonProps) {
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

// eslint-disable-next-line mobx/missing-observer
export const Button = function Button(props: ButtonProps) {
	return <SmallButton center {...props} style={[buttonStyle(), props.style]} />
}

export function buttonStyle() {
	return {
		elevation: 3,
		padding: Spacings.s1,
		margin: Spacings.s1,
		borderRadius: BorderRadiuses.br30,
		backgroundColor: Colors.$backgroundAccent,
	}
}

export type IconButtonProps = ButtonProps & {
	icon: string
	size: number
	iconColor?: string
}

// eslint-disable-next-line mobx/missing-observer
export const IconButton = function IconButton(props: IconButtonProps) {
	return (
		<SmallButton center br10 {...props}>
			<Ionicon
				name={props.icon}
				size={props.size}
				style={
					props.iconColor
						? { color: props.iconColor }
						: (props.style as unknown as object)
				}
			/>
		</SmallButton>
	)
}
