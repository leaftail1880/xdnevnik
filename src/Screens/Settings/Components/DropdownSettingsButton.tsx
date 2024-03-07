import { observer } from 'mobx-react-lite'
import { Falsy, StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import { Text } from 'react-native-paper'
import SelectDropdown, {
	SelectDropdownProps,
} from 'react-native-select-dropdown'
import { dropdown } from '../../../Components/Dropdown'
import { styles } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme'
import { Spacings } from '../../../utils/Spacings'
import { BaseSetting, settingsButtonStyle } from './Base'

type DropdownSettingsButtonProps<Item = object> = BaseSetting & {
	selectionText(i: Item | undefined): string | React.JSX.Element | undefined
	buttonViewStyle?: StyleProp<ViewStyle>
} & SelectDropdownProps<Item>

export const DropdownSettingsButton = observer(function DropdownSettingsButton<
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
				const viewStyle: StyleProp<ViewStyle> = [
					styles.stretch,
					{
						padding: 0,
						width: '100%',
						paddingHorizontal: Spacings.s1,
					},
					props.buttonViewStyle,
				]

				return (
					<View style={viewStyle}>
						<TextOrNode>{props.label}</TextOrNode>
						<TextOrNode
							style={{
								color: Theme.colors.secondary,
							}}
						>
							{value}
						</TextOrNode>
					</View>
				)
			}}
			{...props}
		/>
	)
})

const TextOrNode = observer(function TextOrNode(props: {
	children: React.JSX.Element | Falsy | string
	style?: StyleProp<TextStyle>
}) {
	Theme.key
	return typeof props.children === 'string' ? (
		<Text variant="labelLarge" style={props.style}>
			{props.children || 'По умолчанию'}
		</Text>
	) : (
		props.children
	)
})
