import { useEffect, useState } from 'react'
import { Text, TextProps } from 'react-native-ui-lib'

interface LoadingProps {
	/**
	 * {dots} can be used to set loading dots
	 */
	text?: string
}

export function Loading(props: LoadingProps & TextProps) {
	const [dots, setDots] = useState<string>('.')
	useEffect(() => {
		const timeout = setTimeout(
			() => setDots(dots.length > 4 ? '.' : dots + '.'),
			500
		)
		return () => clearTimeout(timeout)
	}, [dots])

	return (
		<Text margin-s2 center {...props}>
			{(props.text || 'Загрузка{dots}').replace(/\{dots\}/g, dots)}
		</Text>
	)
}
