import { memo } from 'react'
import { Linking } from 'react-native'
import { Text } from 'react-native-paper'
import { Theme } from '~models/theme'

// eslint-disable-next-line mobx/missing-observer
export default memo(function ReleaseBody(props: { body: string }) {
	let body = props.body

	let whatsChanged = false
	const headerR = body.replace(/^## What's Changed/, '')
	if (body !== headerR) {
		whatsChanged = true
		body = headerR
	}

	let fullchangelog: { versions: string; link: string } | undefined
	const footerR = body.match(
		/(\*\*Full Changelog\*\*: (https:\/\/github\.com\/[^/]+\/[^/]+\/compare\/([\d.]+...[\d.]+)))/,
	)
	if (footerR?.[1]) {
		fullchangelog = { versions: footerR[3], link: footerR[2] }
		body = body.replace(footerR[1], '')
	}

	body = body.replace(/\n\*\s/g, '\n- ')

	return (
		<Text variant="bodyMedium">
			{whatsChanged && <Text variant="titleMedium">Изменения</Text>}
			<Text>{body}</Text>
			{fullchangelog && (
				<Text variant="titleSmall">
					Все изменения:{' '}
					<Text
						style={{ color: Theme.colors.secondary }}
						onPress={() => {
							fullchangelog && Linking.openURL(fullchangelog.link)
						}}
					>
						{fullchangelog.versions}
					</Text>
				</Text>
			)}
		</Text>
	)
})
