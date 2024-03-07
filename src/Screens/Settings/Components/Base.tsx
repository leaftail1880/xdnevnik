import { Falsy, ViewStyle } from 'react-native'
import { Theme } from '../../../Stores/Theme'
import { Spacings } from '../../../utils/Spacings'

export function settingsButtonStyle(): ViewStyle {
	return {
		width: '100%',
		backgroundColor: Theme.colors.background,
		margin: Spacings.s1,
		padding: Spacings.s1,
		borderRadius: 0,
	}
}

export type BaseSetting = {
	/**
	 * Label that will be displayed in the right
	 */
	label?: string | React.JSX.Element | Falsy
}
