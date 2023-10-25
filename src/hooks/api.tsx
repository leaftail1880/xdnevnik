import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { API } from '../NetSchool/api'
import { Button } from '../components/button'
import { Loading } from '../components/loading'
import { Text } from '../components/text'
import { LOGGER, RED_ACCENT_COLOR, styles } from '../constants'

/**
 * A way to select only accepted api methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type APIMethod = (arg: Record<string, any>) => Promise<any>
type FunctionsFromObject<O> = {
	[Key in keyof O]: O[Key] extends APIMethod ? O[Key] : never
}

/**
 * Return type of the useAPI hook
 */
export type APIState<Result> =
	| { result: Result; updateDate: string; fallback: undefined }
	| { result: undefined; updateDate: undefined; fallback: React.JSX.Element }

/**
 * Different from Partial<T> is that it requires to define ALL keys
 * but any of them can be undefined
 */
type Optional<T> = { [Key in keyof T]: T[Key] | undefined }

export function useAPI<
	APISource extends object,
	APIMethodName extends keyof FunctionsFromObject<APISource>,
	Fn = FunctionsFromObject<APISource>[APIMethodName],
	FnReturn = Fn extends APIMethod ? Awaited<ReturnType<Fn>> : never
>(
	source: APISource,
	name: APIMethodName,
	params: Fn extends APIMethod ? Optional<Parameters<Fn>[0]> : never,
	description: string,
	additionalDeps: React.DependencyList = [
		API.session ? true : null,
		API.updateEffects,
	]
): APIState<FnReturn> {
	const updateDate = useRef<string>('Не обновлялось')
	const [value, setValue] = useState<FnReturn | undefined>(undefined)
	const [[errorNum, errorObj], setError] = useState<
		[number, Error | undefined]
	>([0, undefined])

	const deps = Object.values(params ?? {}).concat(additionalDeps)

	useEffect(
		() => {
			;(async function useAsyncEffect() {
				const hasUndefinedDeps = deps.some(
					e => typeof e === 'undefined' || e === null
				)

				if (hasUndefinedDeps) return

				try {
					const value = await (source[name] as APIMethod)(params)
					updateDate.current = new Date().toLocaleTimeString()

					setValue(value)
				} catch (error) {
					LOGGER.error(name, error)
					if (!errorObj) setError([errorNum + 1, error])
				}
			})()
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		deps.concat(errorNum)
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
