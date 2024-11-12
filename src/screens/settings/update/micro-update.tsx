import * as Updates from 'expo-updates'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Button, HelperText, IconButton, Text } from 'react-native-paper'
import { Theme } from '~models/theme'
import { Spacings } from '~utils/Spacings'
import { ModalAlert } from '~utils/Toast'

export default observer(function MicroUpdateId() {
	const updateId = Updates.updateId?.slice(-6) ?? 'из сборки'
	const { isUpdateAvailable } = Updates.useUpdates()

	return (
		<Text onPress={openModal}>
			{updateId}
			{isUpdateAvailable && <IconButton icon="reload" />}
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

	const [found, setFound] = useState(false)

	return (
		<View style={{ gap: Spacings.s2 }}>
			<Text>{runTypeMessage}</Text>
			{!isUpdateAvailable ? (
				<Button
					onPress={() => Updates.checkForUpdateAsync()}
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
						Updates.fetchUpdateAsync().then(e => {
							if (e.isNew || e.isRollBackToEmbedded) {
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
