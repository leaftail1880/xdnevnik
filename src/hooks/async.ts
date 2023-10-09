import { useEffect, useState } from 'react'

export function useAsync<T>(
	fn: () => Promise<T>,
	requirements: React.DependencyList = [],
	defaultValue?: T
): T | null {
	const [state, setState] = useState<T | null>(defaultValue ?? null)

	useEffect(() => {
		;(async function useAsyncEffect() {
			if (requirements.length && !requirements.every(Boolean)) return

			const result = await fn()
			if (result === state) return

			setState(result)
		})()
	}, requirements)

	return state
}
