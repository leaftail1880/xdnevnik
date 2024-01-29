import { Falsy, ViewStyle } from 'react-native'
import { Colors, Spacings, Text, TextProps } from 'react-native-ui-lib'

export function settingsButtonStyle(): ViewStyle {
	return {
		width: '100%',
		backgroundColor: Colors.rgba(Colors.$backgroundPrimaryMedium, 0.5),
		padding: Spacings.s3,
		marginBottom: Spacings.s1,
	}
}

export type BaseSetting = {
	/**
	 * Label that will be displayed in the right
	 */
	label?: string | React.JSX.Element | Falsy
}

// eslint-disable-next-line mobx/missing-observer
export const SettingsText = function SettingsText(props: TextProps) {
	return <Text style={{ fontSize: 18 }} {...props} />
}
