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
	success: createToast('secondaryContainer'),
	error: createToast('errorContainer'),
}

function createToast(color: Exclude<keyof MD3Colors, 'elevation'>) {
	// eslint-disable-next-line mobx/missing-observer
	return function Toast(props: ToastConfigParams<unknown>) {
		return (
			<Observer>
				{() => (
					<BaseToast
						{...props}
						text1Style={[
							Theme.fonts.titleMedium,
							{ color: Theme.colors.onErrorContainer },
						]}
						text2Style={Theme.fonts.bodyMedium}
						style={{
							backgroundColor: Theme.colors[color],
						}}
					/>
				)}
			</Observer>
		)
	}
}
