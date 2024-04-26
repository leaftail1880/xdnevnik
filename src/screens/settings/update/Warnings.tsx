import { observer } from 'mobx-react-lite'
import { memo, useCallback, useMemo } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { Chip } from 'react-native-paper'
import semver from 'semver'
import { styles } from '../../../constants'
import { Theme } from '../../../models/theme'
import { Spacings } from '../../../utils/Spacings'
import { ModalAlert } from '../../../utils/Toast'

// eslint-disable-next-line mobx/missing-observer
export default memo(function Warnings(props: { version: string }) {
	if (!props.version) return false
	const versionNum = semver.parse(props.version)

	return (
		<View style={styles.row}>
			{Object.entries(minFeatureVersions)
				.filter(e => {
					const compare = versionNum?.compare(e[1][0])
					if (compare === -1 || compare === 0) return true

					return false
				})
				.map(e => (
					<WarningChip key={e[1][1]} title={e[1][1]} body={e[1][2]} />
				))}
		</View>
	)
})

const WarningChip = observer(function WarningChip(props: {
	title: string
	body: string
}) {
	const onPress = useCallback(() => {
		ModalAlert.show(props.title, props.body)
	}, [props.body, props.title])

	const style = useMemo<StyleProp<ViewStyle>>(
		() => ({
			marginTop: Spacings.s2,
			marginRight: Spacings.s2,
			backgroundColor: Theme.colors.errorContainer,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[Theme.colors.errorContainer],
	)

	return (
		<Chip style={style} onPress={onPress}>
			{props.title}
		</Chip>
	)
})

const minFeatureVersions = {
	updatesScreen: [
		'0.13.0',
		'Старые обновления',
		'В этой версии поддерживается обновление только до последней версии, вы не сможете выбрать версию из списка, как сейчас',
	],
	oldStorage: [
		'0.11.6',
		'Старое хранилище',
		'В этой версии данные хранились по-другому, ваши настройки там не будут использованы. Но и удалены не будут.',
	],
	login: [
		'0.0.5',
		'Сломан вход',
		'В этой версии сломан вход, придется перезаходить',
	],
	inAppUpdate: [
		'0.0.0',
		'Нет обновлений',
		'В этой версии нет обновлений внутри приложения, вам нужно будет вручную скачать и установить новую версию',
	],
} satisfies Record<string, [string, string, string]>
