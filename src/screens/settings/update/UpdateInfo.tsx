import * as Application from 'expo-application'
import * as Updates from 'expo-updates'
import { memo } from 'react'
import { StyleSheet } from 'react-native'
import { Card, Text } from 'react-native-paper'
import { styles as globalStyles } from '../../../constants'
import { Spacings } from '../../../utils/Spacings'
import { ModalAlert } from '../../../utils/Toast'
import { getUpdateIdShort } from './utils'

// eslint-disable-next-line mobx/missing-observer
export default memo(function UpdateInfo() {
	return (
		<Card style={styles.updatesCard}>
			<Card.Content style={globalStyles.stretch}>
				<Text>Версия: </Text>
				<Text variant="labelLarge">{Application.nativeApplicationVersion}</Text>
			</Card.Content>
			<Card.Content style={globalStyles.stretch}>
				<Text>Сборка: </Text>
				<Text variant="labelLarge" onPress={buildInfo}>
					{getUpdateIdShort() ?? 'По умолчанию'}
				</Text>
			</Card.Content>
		</Card>
	)
})

const buildInfo = () =>
	ModalAlert.show(
		'Версия сборки',
		'Некоторые баги не требуют обновления всего дневника, для них создается небольшая сборка которую приложение устанавливает при каждом запуске.\nПолная версия сборки: ' +
			(Updates.updateId ?? 'По умолчанию'),
	)

const styles = StyleSheet.create({
	updatesCard: { margin: Spacings.s2, marginTop: Spacings.s3 },
})
