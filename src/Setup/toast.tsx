// App.jsx
import { Observer } from 'mobx-react-lite'
import { MD3Colors } from 'react-native-paper/lib/typescript/types'
import {
	BaseToast,
	ToastConfigParams,
	type ToastConfig as ToastConfigType,
} from 'react-native-toast-message'
import { Theme } from '../Stores/Theme'

export const ToastConfig: ToastConfigType = {
	success: createToast('secondaryContainer', 'onSecondaryContainer'),
	error: createToast('errorContainer', 'onErrorContainer'),
}

function createToast(
	color: Exclude<keyof MD3Colors, 'elevation'>,
	textColor: Exclude<keyof MD3Colors, 'elevation'>
) {
	// eslint-disable-next-line mobx/missing-observer
	return function Toast(props: ToastConfigParams<unknown>) {
		const textStyle = { color: Theme.colors[textColor] }
		return (
			<Observer>
				{() => (
					<BaseToast
						{...props}
						text1Style={[Theme.fonts.titleMedium, textStyle]}
						text2Style={[Theme.fonts.bodyMedium, textStyle]}
						text2NumberOfLines={4}
						style={{
							backgroundColor: Theme.colors[color],
							height: '110%',
						}}
					/>
				)}
			</Observer>
		)
	}
}
