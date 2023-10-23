import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { API } from '../NetSchool/api'
import { Button } from '../components/button'
import { Loading } from '../components/loading'
import { Text } from '../components/text'
import { RED_ACCENT_COLOR, styles } from '../constants'

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

/**
 * Different from Partial<T> is that it requires to define ALL keys
 * but them can be undefined
 */
type Optional<T> = { [Key in keyof T]: T[Key] | undefined }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiCall = (arg: Record<string, any>) => Promise<any>
type ObjectWithFunctions<T> = {
	[Key in keyof T]: T[Key] extends ApiCall ? T[Key] : never
}
export type ApiState<Result> =
	| { result: Result; updateDate: string; fallback: undefined }
	| { result: undefined; updateDate: undefined; fallback: React.JSX.Element }
export function useAPI<
	Source extends object,
	Name extends keyof ObjectWithFunctions<Source>,
	Fn = ObjectWithFunctions<Source>[Name],
	Result = Fn extends ApiCall ? Awaited<ReturnType<Fn>> : never
>(
	source: Source,
	name: Name,
	params: Fn extends ApiCall ? Optional<Parameters<Fn>[0]> : never,
	description: string,
	additionalDeps: React.DependencyList = [API.authorized]
): ApiState<Result> {
	const updateDate = useRef<string>('Не обновлялось')
	const [value, setValue] = useState<Result | undefined>(undefined)
	const [[errorNum, errorObj], setError] = useState<
		[number, Error | undefined]
	>([0, undefined])

	useEffect(
		() => {
			;(async function useAsyncEffect() {
				if (
					Object.values(params ?? {}).some(
						e => typeof e === 'undefined' && e === null
					)
				)
					return

				try {
					const value = await (source[name] as ApiCall)(params)
					updateDate.current = new Date().toLocaleTimeString()
					setValue(value)
				} catch (error) {
					setError([errorNum, error])
				}
			})()
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		Object.values(params ?? {})
			.concat(errorNum)
			.concat(additionalDeps)
	)

	// Value is present, all okay
	if (typeof value !== 'undefined' && value) {
		return {
			result: value,
			updateDate: updateDate.current,
			fallback: undefined,
		}
	}

	const fallback = errorObj ? (
		<ErrorHandler
			error={[errorNum, errorObj]}
			reload={() => {
				setError([errorNum + 1, undefined])
			}}
			name={description}
		/>
	) : (
		<Loading text={`Загрузка ${description}{dots}`} />
	)

	// No value, return fallback element
	return { result: undefined, updateDate: undefined, fallback }
}

interface ErrorHandlerProps {
	error: [number, Error]
	reload: () => void
	name: string
}

function ErrorHandler({ error, reload, name }: ErrorHandlerProps) {
	return (
		<View
			style={{
				...styles.container,

				alignSelf: 'center',
				maxWidth: 300,
				maxHeight: 200,
			}}
		>
			<Text style={{ fontSize: 20, color: RED_ACCENT_COLOR }}>
				Ошибка ({error[0] ? error[0] : ''})
			</Text>
			<Text style={{ fontSize: 15 }}>При загрузке {name}</Text>
			<Text>
				{error[1].name !== 'Error' ? error[1].name + ': ' : ''}{' '}
				{error[1].message}
			</Text>
			{/* <Text>{error.stack}</Text> */}
			<Button
				onPress={reload}
				style={[styles.button, { maxHeight: 40, padding: 4, width: '100%' }]}
			>
				<Text style={styles.buttonText}>Попробовать снова</Text>
			</Button>
		</View>
	)
}
