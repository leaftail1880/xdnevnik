import { StyleProp, ViewStyle } from 'react-native'
import { BorderRadiuses, Colors } from 'react-native-ui-lib'

export function dropdownButtonStyle(): StyleProp<ViewStyle> {
	return {
		elevation: 10,
		alignSelf: 'center',
		width: '100%',
		backgroundColor: Colors.$backgroundPrimaryMedium,
		borderBottomLeftRadius: BorderRadiuses.br50,
		borderBottomRightRadius: BorderRadiuses.br50,
	}
}

export function dropdownStyle(): ViewStyle {
	return {
		borderRadius: BorderRadiuses.br40,
		alignContent: 'center',
		backgroundColor: Colors.$backgroundPrimaryLight,
	}
}

export function dropdown() {
	return {
		buttonStyle: dropdownButtonStyle(),
		dropdownStyle: dropdownStyle(),
	}
}
