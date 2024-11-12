import * as Updates from 'expo-updates'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { Button, HelperText, Text } from 'react-native-paper'
import { Theme } from '~models/theme'
import { Spacings } from '~utils/Spacings'
import { ModalAlert } from '~utils/Toast'

export default observer(function MicroUpdateId() {
	const updateId = Updates.updateId?.slice(-6) ?? 'из сборки'
	const { isUpdateAvailable } = Updates.useUpdates()

	const update = isUpdateAvailable

	return (
		<Text
			onPress={openModal}
			// eslint-disable-next-line react-native/no-color-literals
			style={{
				backgroundColor: update
					? Theme.colors.errorContainer
					: Theme.colors.background,

				color: update ? Theme.colors.error : Theme.colors.onSecondaryContainer,

				fontWeight: update ? 'bold' : 'normal',
			}}
		>
			{updateId}
		</Text>
	)
})

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

	const [found, setFound] = useState(true)

	const timeout = useRef<number>()
	useEffect(() => {
		clearTimeout(timeout.current)
		if (!found) {
			timeout.current = setTimeout(
				() => setFound(true),
				5000,
			) as unknown as number
		}
	}, [found])

	async function wrap<T>(promise: Promise<T>, onResolve: (t: T) => void) {
		try {
			onResolve(await promise)
		} catch (e) {
			setFound(false)
		}
	}

	return (
		<View style={{ gap: Spacings.s2 }}>
			<Text>{runTypeMessage}</Text>
			{!isUpdateAvailable ? (
				<Button
					onPress={() =>
						wrap(Updates.checkForUpdateAsync(), () => setFound(true))
					}
					style={{ backgroundColor: Theme.colors.secondaryContainer }}
				>
					<HelperText type="info">
						{found ? 'Проверить наличие микрообновлений' : 'Не удалось найти'}
					</HelperText>
				</Button>
			) : (
				<Button
					style={{ backgroundColor: Theme.colors.secondaryContainer }}
					onPress={() =>
						wrap(Updates.fetchUpdateAsync(), result => {
							if (result.isNew || result.isRollBackToEmbedded) {
								Updates.reloadAsync()
								setFound(true)
							} else setFound(false)
						})
					}
				>
					<HelperText type="info">Скачать и запустить микрообнову</HelperText>
				</Button>
			)}
		</View>
	)
})
