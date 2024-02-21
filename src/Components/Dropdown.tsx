import { StyleProp, ViewStyle } from 'react-native'
import { Theme } from '../Stores/Theme'

export function dropdownButtonStyle(): StyleProp<ViewStyle> {
	return {
		alignSelf: 'center',
		width: '100%',
		backgroundColor: Theme.colors.elevation.level2,
		borderBottomLeftRadius: Theme.roundness,
		borderBottomRightRadius: Theme.roundness,
	}
}

export function dropdownStyle(): ViewStyle {
	return {
		backgroundColor: Theme.colors.background,
		borderRadius: Theme.roundness,
		alignContent: 'center',
	}
}

export function dropdown() {
	return {
		buttonStyle: dropdownButtonStyle(),
		dropdownStyle: dropdownStyle(),
		rowTextStyle: { color: Theme.colors.onSurface, fontSize: 16 },
		rowStyle: { borderColor: Theme.colors.backdrop },
		selectedRowTextStyle: { color: Theme.colors.secondary },
	}
}
