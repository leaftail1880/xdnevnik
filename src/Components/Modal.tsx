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
import { styles } from '../constants'
import { Theme } from '../models/theme'
import { ModalAlert, Toast } from '../utils/Toast'

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

const DialogModal = observer(function DialogModal() {
	return (
		<Portal>
			{ModalAlert.state && (
				<Dialog
					visible
					dismissable
					onDismiss={ModalAlert.close}
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
							onPress={ModalAlert.close}
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
