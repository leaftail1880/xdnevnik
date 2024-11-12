import { Text } from 'react-native-paper'

// eslint-disable-next-line mobx/missing-observer
export function Size({ t }: { t: unknown }) {
	if (typeof t === 'undefined') return 'empty'

	const length =
		typeof t === 'number'
			? t
			: typeof t === 'string'
				? t.length
				: JSON.stringify(t ?? '').length

	for (const [size, chars] of (
		[
			['byte', 1],
			['KB', 1024],
			['MB', 1024 * 1024],
			['GB', 1024 * 1024 * 1024],
		] as [string, number][]
	).reverse()) {
		if (length / chars < 0.01) continue
		return (
			<Text style={{ fontWeight: 'bold' }}>
				{(length / chars).toFixed(2)}
				{size}
			</Text>
		)
	}

	return <Text style={{ fontWeight: 'bold' }}>{length}chars</Text>
}
