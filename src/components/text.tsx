import { useTheme } from '@react-navigation/native'
import ReactNative, { TextProps } from 'react-native'

export function Text(props: TextProps) {
	const theme = useTheme()
	return (
		<ReactNative.Text
			{...props}
			style={[{ color: theme.colors.text }, props.style]}
		/>
	)
}
