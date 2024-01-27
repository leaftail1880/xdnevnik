import { StyleProp, ViewStyle } from 'react-native'
import SelectDropdown, {
	SelectDropdownProps,
} from 'react-native-select-dropdown'
import { Colors, Text, View } from 'react-native-ui-lib'
import { dropdownStyle } from '../../../Components/Dropdown'
import { BaseSetting, settingsButtonStyle } from './Base'

type DropdownSettingsButtonProps<Item = object> = BaseSetting & {
	selectionText(i: Item | undefined): string | React.JSX.Element | undefined
	buttonViewStyle?: StyleProp<ViewStyle>
} & SelectDropdownProps<Item>

// eslint-disable-next-line mobx/missing-observer
export const DropdownSettingsButton = function DropdownSettingsButton<
	Item = object
>(props: DropdownSettingsButtonProps<Item>) {
	const selectionText = (i: Item) => {
		const value = props.selectionText(i)

		if (typeof value === 'string') return value
		return 'Выберите...'
	}
	return (
		<SelectDropdown
			buttonStyle={settingsButtonStyle()}
			dropdownStyle={dropdownStyle()}
			rowTextStyle={{ color: Colors.$textPrimary }}
			buttonTextAfterSelection={selectionText}
			rowTextForSelection={selectionText}
			selectedRowTextStyle={{ color: Colors.rgba(Colors.$textPrimary, 0.5) }}
			defaultButtonText={
				typeof props.label === 'string' ? props.label : undefined
			}
			renderCustomizedButtonChild={i => {
				const value = props.selectionText(i)
				return (
					<View
						flex
						row
						spread
						centerV
						paddingH-s3
						style={[{ width: '100%' }, props.buttonViewStyle]}
					>
						{typeof props.label === 'string' ? (
							<Text style={{ fontSize: 18 }}>{props.label}</Text>
						) : (
							props.label
						)}
						{typeof value === 'string' ? (
							<Text
								style={{
									fontSize: 18,
									color: Colors.rgba(Colors.$textPrimary, 0.7),
								}}
							>
								{value || 'По умолчанию'}
							</Text>
						) : (
							value
						)}
					</View>
				)
			}}
			{...props}
		/>
	)
}
