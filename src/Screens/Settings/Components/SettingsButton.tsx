import { Button, ButtonProps, View } from 'react-native-ui-lib'
import { BaseSetting, settingsButtonStyle } from './Base'

export type SettingsButtonProps = BaseSetting & ButtonProps

// eslint-disable-next-line mobx/missing-observer
export const SettingsButton = function SettingsButton(
	props: SettingsButtonProps
) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { label, children, ...buttonProps } = props
	return (
		<Button {...buttonProps} style={[settingsButtonStyle(), props.style]}>
			<View row spread centerV padding-s1 style={{ width: '100%' }}>
				{children}
			</View>
		</Button>
	)
}
