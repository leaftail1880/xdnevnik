import { Theme } from '@/models/theme'
import { observer } from 'mobx-react-lite'
import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { Badge, Chip } from 'react-native-paper'
import { ModalAlert } from '../../../utils/Toast'

// eslint-disable-next-line mobx/missing-observer
export const BetaChip = memo(function BetaChip() {
	return (
		<Chip compact onPress={betaChipWarning}>
			Бета
		</Chip>
	)
})

const betaChipWarning = () =>
	ModalAlert.show(
		'Бета версия',
		'Эта версия приложения может работать нестабильно, но содержит новые функции. Пробуйте на свой страх и риск.',
	)

// eslint-disable-next-line mobx/missing-observer
export const FilesizeChip = memo(function FilesizeChip({
	size,
}: {
	size: number | undefined
}) {
	const onPress = useCallback(
		() =>
			ModalAlert.show(
				size ? 'Вес файла' : 'Файла нет',
				size
					? 'Показывает, сколько весит .APK или .IPA файл. Не является тем же весом, что вы получите после установки.'
					: 'После публикации обновления нужно время, чтобы оно было собрано и запакованно в файл. Сборка обычно занимает 6-7 минут. Наберитесь терпения, скоро он появится!',
			),
		[size],
	)

	return (
		<Chip onPress={onPress} compact>
			{size ? `${(size / 1024 / 1024).toFixed(2)}мб` : 'Файла нет'}
		</Chip>
	)
})

export const NewVersionChip = observer(function NewVersionChip() {
	return (
		<Chip
			style={{
				backgroundColor: Theme.colors.errorContainer,
			}}
			onPress={newVersionChipModal}
			compact
		>
			Новая версия
			<View>
				<Badge style={styles.badge} size={6} />
			</View>
		</Chip>
	)
})

const newVersionChipModal = () =>
	ModalAlert.show(
		'Новая версия!',
		'Обновитесь скорее, чтобы получить новые функции и фиксы багов!',
	)

const styles = StyleSheet.create({
	badge: {
		position: 'relative',
		top: -8,
		right: -2,
	},
})
