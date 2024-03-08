import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { IconButton, Snackbar, Text } from 'react-native-paper'
import Animated from 'react-native-reanimated'
import { styles } from '../Setup/constants'
import { Theme } from '../Stores/Theme'

type ToastInfo = {
	title: string
	body?: string
	error?: boolean
}

export const Toast = new (class {
	constructor() {
		makeAutoObservable<this, 'timeout'>(
			this,
			{ timeout: false },
			{ autoBind: true }
		)
	}

	private timeout: ReturnType<typeof setTimeout>

	show({
		title,
		body,
		error,
		timeout = 7000,
	}: ToastInfo & { timeout?: number }) {
		this.state = { title, body, error }

		if (this.timeout) clearTimeout(this.timeout)
		this.timeout = setTimeout(this.hide, timeout)
	}

	hide() {
		this.state = null
	}

	state: ToastInfo | null = null
})()

export default observer(function ToastModal() {
	return (
		Toast.state && (
			<Animated.View>
				<Snackbar
					visible={!!Toast.state}
					onDismiss={Toast.hide}
					style={{
						bottom: 62,
						width: '100%',
						margin: 0,
						backgroundColor: Toast.state.error
							? Theme.colors.errorContainer
							: Theme.colors.elevation.level5,
					}}
				>
					<View style={[styles.stretch, { flex: 1, width: '100%' }]}>
						<View style={{ flex: 8 }}>
							<Text style={[Theme.fonts.titleSmall, {}]}>
								{Toast.state.title}
							</Text>
							{Toast.state.body && (
								<Text style={[Theme.fonts.bodySmall, {}]}>
									{Toast.state.body}
								</Text>
							)}
						</View>
						<IconButton
							style={{ flex: 1 }}
							icon={'close'}
							onPress={Toast.hide}
						/>
					</View>
				</Snackbar>
			</Animated.View>
		)
	)
})
