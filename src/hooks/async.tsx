import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { Button } from '../components/button'
import { Loading } from '../components/loading'
import { RED_ACCENT_COLOR, STYLES } from '../constants'

export type AsyncState<T> = [T, undefined] | [undefined, React.JSX.Element]
export function useAsync<T>(
	fn: () => Promise<T>,
	name: string,
	requirements: React.DependencyList = [],
	defaultValue?: T
): AsyncState<T> {
	const [value, setValue] = useState<T | undefined>(defaultValue)
	const [[errorNum, errorObj], setError] = useState<
		[number, Error | undefined]
	>([0, undefined])

	useEffect(() => {
		;(async function useAsyncEffect() {
			if (requirements.length && !requirements.every(Boolean)) return

			try {
				setValue(await fn())
			} catch (error) {
				setError([errorNum + 1, error])
			}
		})()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [...requirements, errorNum])

	// Value is present, all okay
	if (typeof value !== 'undefined' && value) return [value, undefined]

	const element = errorObj ? (
		<ErrorHandler
			error={[errorNum, errorObj]}
			reload={() => {
				setError([errorNum + 1, undefined])
			}}
			name={name}
		/>
	) : (
		<Loading text={`Загрузка ${name}{dots}`} />
	)

	// No value, return fallback element
	return [void 0, element]
}

interface ErrorHandlerProps {
	error: [number, Error]
	reload: () => void
	name: string
}

function ErrorHandler({ error, reload, name }: ErrorHandlerProps) {
	return (
		<View style={{ ...STYLES.container, backgroundColor: '#fff0' }}>
			<Text style={{ fontSize: 30, color: RED_ACCENT_COLOR, margin: 10 }}>
				Ошибка {error[0] ? error[0] : ''}
			</Text>
			<Text style={{ fontSize: 15 }}>При загрузке {name}</Text>

			<Text>
				{error[1].name}: {error[1].message}
			</Text>
			{/* <Text>{error.stack}</Text> */}
			<Button onPress={reload} style={STYLES.button}>
				<Text style={STYLES.buttonText}>Попробовать снова</Text>
			</Button>
		</View>
	)
}
