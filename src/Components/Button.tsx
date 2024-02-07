import {
	BorderRadiuses,
	Colors,
	Spacings,
	type TouchableOpacityProps,
} from 'react-native-ui-lib'
import TouchableOpacity from 'react-native-ui-lib/touchableOpacity'
import { Ionicon } from './Icon'

// eslint-disable-next-line mobx/missing-observer
export const Button = function Button(props: TouchableOpacityProps) {
	return (
		<TouchableOpacity center {...props} style={[buttonStyle(), props.style]} />
	)
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

export type IconButtonProps = TouchableOpacityProps & {
	icon: string
	size: number
	iconColor?: string
}

// eslint-disable-next-line mobx/missing-observer
export const IconButton = function IconButton(props: IconButtonProps) {
	return (
		<TouchableOpacity center br10 {...props}>
			<Ionicon
				name={props.icon}
				size={props.size}
				style={
					props.iconColor
						? { color: props.iconColor }
						: (props.style as unknown as object)
				}
			/>
		</TouchableOpacity>
	)
}
