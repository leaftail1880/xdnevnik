import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import {
	Button,
	Dialog,
	IconButton,
	Portal,
	Snackbar,
	Text,
} from 'react-native-paper'
import Animated from 'react-native-reanimated'
import { styles } from '../Setup/constants'
import { Theme } from '../Stores/Theme'

type ModalInfo = {
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

	state: ModalInfo | null = null

	show({
		title,
		body,
		error,
		timeout = 7000,
	}: ModalInfo & { timeout?: number }) {
		this.state = { title, body, error }

		if (this.timeout) clearTimeout(this.timeout)
		this.timeout = setTimeout(this.hide, timeout)
	}

	hide() {
		this.state = null
	}
})()

// eslint-disable-next-line mobx/missing-observer
export default function ModalProvider() {
	return (
		<>
			<ToastModal />
			<DialogModal />
		</>
	)
}

const ToastModal = observer(function ToastModal() {
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
							icon={'close'}
							onPress={Toast.hide}
							style={{ flex: 1, margin: 0, padding: 0 }}
						/>
					</View>
				</Snackbar>
			</Animated.View>
		)
	)
})

export const ModalAlert = new (class {
	constructor() {
		makeAutoObservable(this)
	}

	state: ModalInfo | null = null
	show(title: string, body?: string, error?: boolean) {
		this.state = { title, body, error }
	}
})()

const DialogModal = observer(function DialogModal() {
	return (
		<Portal>
			{ModalAlert.state && (
				<Dialog
					visible
					style={{
						backgroundColor: ModalAlert.state.error
							? Theme.colors.errorContainer
							: Theme.colors.elevation.level3,
					}}
				>
					<Dialog.Title>{ModalAlert.state.title}</Dialog.Title>
					{ModalAlert.state.body && (
						<Dialog.Content>
							<Text>{ModalAlert.state.body}</Text>
						</Dialog.Content>
					)}
					<Dialog.Actions>
						<Button
							onPress={() => runInAction(() => (ModalAlert.state = null))}
							labelStyle={
								ModalAlert.state.error && {
									color: Theme.colors.onErrorContainer,
								}
							}
						>
							Закрыть
						</Button>
					</Dialog.Actions>
				</Dialog>
			)}
		</Portal>
	)
})
