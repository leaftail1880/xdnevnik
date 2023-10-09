import { useEffect, useState } from 'react'

interface LoadingProps {
	/**
	 * {dots} can be used to set loading dots
	 */
	text: string
}

export function Loading(props: LoadingProps) {
	const [dots, setDots] = useState<string>()
	useEffect(() => {
		const interval = setInterval(
			() => setDots(dots.length < 5 ? dots + '.' : '.'),
			1000
		)
		return () => clearInterval(interval)
	}, [])

	return props.text.replace(/\{dots\}/g, dots)
}
