import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Text } from './Text'

interface LoadingProps {
	/**
	 * {dots} can be used to set loading dots
	 */
	text?: string
}

export function Loading(props: LoadingProps) {
	const [dots, setDots] = useState<string>('.')
	useEffect(() => {
		const timeout = setTimeout(
			() => setDots(dots.length > 4 ? '.' : dots + '.'),
			500
		)
		return () => clearTimeout(timeout)
	}, [dots])

	return (
		<View>
			<Text margin-20 style={{ alignSelf: 'center' }}>
				{(props.text || 'Загрузка{dots}').replace(/\{dots\}/g, dots)}
			</Text>
		</View>
	)
}
