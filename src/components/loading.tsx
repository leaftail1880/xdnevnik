import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Text } from './text'

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
			<Text style={{ fontSize: 15, alignSelf: 'center', margin: 20 }}>
				{(props.text || 'Загрузка{dots}').replace(/\{dots\}/g, dots)}
			</Text>
		</View>
	)
}
