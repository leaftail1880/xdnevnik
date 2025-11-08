import { Theme } from '@/models/theme'
import { Spacings } from '@/utils/Spacings'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Button, Dialog, Portal, Text } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
	const insets = useSafeAreaInsets()
	return (
		Toast.state && (
			<View
				onTouchStart={Toast.hide}
				style={{
					position: 'absolute',
					bottom: insets.bottom + 80,
					width: '100%',
					margin: 0,
					backgroundColor: Toast.state.error
						? Theme.colors.errorContainer
						: Theme.colors.elevation.level5,
					justifyContent: 'center',
					alignContent: 'center',
					padding: Spacings.s1 / 2,
				}}
			>
				<Text style={[Theme.fonts.titleSmall, {}]}>
					{Toast.state.title + ': '}
					{Toast.state.body && (
						<Text style={[Theme.fonts.bodySmall, {}]}>{Toast.state.body}</Text>
					)}
				</Text>
			</View>
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
					<Dialog.Title style={Theme.fonts.titleMedium}>
						{ModalAlert.state.title}
					</Dialog.Title>
					{ModalAlert.state.body && (
						<Dialog.Content>
							{typeof ModalAlert.state.body === 'object' ? (
								ModalAlert.state.body
							) : (
								<Text>{ModalAlert.state.body}</Text>
							)}
						</Dialog.Content>
					)}
					<Actions />
				</Dialog>
			)}
		</Portal>
	)
})

const Actions = observer(function Actions() {
	if (!ModalAlert.state) return

	const labelStyle = ModalAlert.state.error && {
		color: Theme.colors.onErrorContainer,
	}

	return (
		<Dialog.Actions style={{ flexWrap: 'wrap' }}>
			{ModalAlert.state.buttons?.map((e, i) => (
				<Button onPress={e.callback} key={i.toString()} labelStyle={labelStyle}>
					{e.label}
				</Button>
			))}
			<Button onPress={ModalAlert.close} labelStyle={labelStyle}>
				Закрыть
			</Button>
		</Dialog.Actions>
	)
})
