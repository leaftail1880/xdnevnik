import { StyleProp, View, ViewStyle } from 'react-native'
import { Text } from 'react-native-paper'
import SelectDropdown, {
	SelectDropdownProps,
} from 'react-native-select-dropdown'
import { dropdown } from '../../../Components/Dropdown'
import { Spacings } from '../../../Components/Spacings'
import { styles } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme'
import { BaseSetting, settingsButtonStyle } from './Base'

type DropdownSettingsButtonProps<Item = object> = BaseSetting & {
	selectionText(i: Item | undefined): string | React.JSX.Element | undefined
	buttonViewStyle?: StyleProp<ViewStyle>
} & SelectDropdownProps<Item>

// eslint-disable-next-line mobx/missing-observer
export const DropdownSettingsButton = function DropdownSettingsButton<
	Item = object
>(props: DropdownSettingsButtonProps<Item>) {
	Theme.key
	const selectionText = (i: Item) => {
		const value = props.selectionText(i)

		if (typeof value === 'string') return value
		return 'Выберите...'
	}

	return (
		<SelectDropdown
			{...dropdown()}
			buttonStyle={settingsButtonStyle()}
			buttonTextAfterSelection={selectionText}
			rowTextForSelection={selectionText}
			defaultButtonText={
				typeof props.label === 'string' ? props.label : undefined
			}
			renderCustomizedButtonChild={i => {
				const value = props.selectionText(i)
				return (
					<View
						style={[
							styles.stretch,
							{
								padding: 0,
								width: '100%',
								paddingHorizontal: Spacings.s1,
							},
							props.buttonViewStyle,
						]}
					>
						{typeof props.label === 'string' ? (
							<Text variant="labelLarge">{props.label}</Text>
						) : (
							props.label
						)}
						{typeof value === 'string' ? (
							<Text
								style={[
									Theme.fonts.labelLarge,
									{
										color: Theme.colors.secondary,
									},
								]}
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
