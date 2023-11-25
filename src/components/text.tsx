import { useTheme } from '@react-navigation/native'
import type { TextProps } from 'react-native-ui-lib'
import RNUIText from 'react-native-ui-lib/text'

export function Text(props: TextProps) {
	const theme = useTheme()
	return (
		<RNUIText
			{...props}
			style={[{ color: theme.colors.text, fontSize: 15 }, props.style]}
		/>
	)
}
