import { Theme } from '@/models/theme'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import * as Updates from 'expo-updates'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { Button, HelperText, Text, TouchableRipple } from 'react-native-paper'

export default observer(function MicroUpdateId() {
	const updateId = Updates.updateId?.slice(-6) ?? 'из сборки'
	const { isUpdateAvailable } = Updates.useUpdates()

	const update = isUpdateAvailable

	const text = (
		<Text
			onPress={openModal}
			style={{
				color: update ? Theme.colors.error : Theme.colors.onSecondaryContainer,

				fontWeight: update ? 'bold' : 'normal',
			}}
		>
			{update && 'Обновление: '}
			{updateId}
		</Text>
	)

	if (update)
		return (
			<TouchableRipple
				onPress={openModal}
				style={{
					backgroundColor: Theme.colors.errorContainer,
					paddingVertical: 2,
					paddingHorizontal: 8,
					borderRadius: Theme.roundness,
				}}
			>
				{text}
			</TouchableRipple>
		)
	return text
})

enum UpdateCheckState {
	Default,
	NotAvailable,
	Available,
	Error,
}

const states: Record<UpdateCheckState, string> = {
	[UpdateCheckState.Default]: 'Проверить наличие микрообновлений',
	[UpdateCheckState.Error]: 'Ошибка',
	[UpdateCheckState.Available]: 'Проверить наличие микрообновлений',
	[UpdateCheckState.NotAvailable]: 'Нет обновлений',
}

const openModal = () => ModalAlert.show('Микрообновления', <MicroUpdateModal />)

const MicroUpdateModal = observer(function MicroUpdateModal() {
	const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
		Updates.useUpdates()

	useEffect(() => {
		if (isUpdatePending) {
			// Update has successfully downloaded
			Updates.reloadAsync()
		}
	}, [isUpdatePending])

	// Show whether or not we are running embedded code or an update
	const runTypeMessage = currentlyRunning.isEmbeddedLaunch
		? 'Запущено из сборки'
		: 'Запущено из микрообновления'

	const [state, setState] = useState(UpdateCheckState.Default)

	const timeout = useRef<number | undefined>(undefined)
	useEffect(() => {
		if (timeout.current) clearTimeout(timeout.current)
		if (state !== UpdateCheckState.Default) {
			timeout.current = setTimeout(
				() => setState(UpdateCheckState.Default),
				5000,
			) as unknown as number
		}
	}, [state])

	async function wrap<T>(promise: Promise<T>, onResolve: (t: T) => void) {
		try {
			onResolve(await promise)
		} catch (e) {
			setState(UpdateCheckState.Error)
		}
	}

	return (
		<View style={{ gap: Spacings.s2 }}>
			<Text>{runTypeMessage}</Text>
			{!isUpdateAvailable ? (
				<Button
					onPress={() =>
						wrap(Updates.checkForUpdateAsync(), e =>
							setState(
								e.isAvailable
									? UpdateCheckState.Available
									: UpdateCheckState.NotAvailable,
							),
						)
					}
					style={{ backgroundColor: Theme.colors.secondaryContainer }}
				>
					<HelperText type="info">{states[state]}</HelperText>
				</Button>
			) : (
				<Button
					style={{ backgroundColor: Theme.colors.secondaryContainer }}
					onPress={() =>
						wrap(Updates.fetchUpdateAsync(), result => {
							if (result.isNew || result.isRollBackToEmbedded) {
								setState(UpdateCheckState.Available)
								Updates.reloadAsync()
							} else {
								setState(UpdateCheckState.NotAvailable)
							}
						})
					}
				>
					<HelperText type="info">Скачать и запустить микрообнову</HelperText>
				</Button>
			)}
		</View>
	)
})
