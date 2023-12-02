import { useEffect, useRef, useState } from 'react'
import { RefreshControl } from 'react-native'
import { API, NetSchoolError } from '../NetSchool/api'
import { ErrorHandler } from '../components/ErrorHandler'
import { Loading } from '../components/Loading'
import { LOGGER } from '../constants'

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
export type APIState<Result> = (
	| { result: Result; updateDate: string; fallback: undefined }
	| { result: undefined; updateDate: undefined; fallback: React.JSX.Element }
) & { reload: () => void; refreshControl: React.JSX.Element }

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
	const [[updateTimes, errorObj], setError] = useState<
		[number, Error | undefined]
	>([0, undefined])
	const loading = useRef<boolean>(false)

	const deps = Object.values(params ?? {}).concat(additionalDeps)

	useEffect(
		() => {
			loading.current = true
			;(async function useAsyncEffect() {
				const hasUndefinedDeps = deps.some(
					e => typeof e === 'undefined' || e === null
				)

				if (hasUndefinedDeps) return

				// LOGGER.debug('Request update for', name)

				try {
					const value = await (source[name] as APIMethod)(params)
					updateDate.current =
						'Дата обновления: ' + new Date().toLocaleTimeString()
				loading.current = false

					setValue(value)
				} catch (error) {
					if (!(error instanceof NetSchoolError && error.canIgnore)) {
						LOGGER.error(name, error)
					}
					if (!errorObj) setError([updateTimes, error])
				}
			})()
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		deps.concat(updateTimes)
	)

	const reload = () => {
		setError([updateTimes + 1, undefined])
	}

	const refreshControl = (
		<RefreshControl onRefresh={reload} refreshing={loading.current} />
	)

	// Value is present, all okay
	if (typeof value !== 'undefined' && value !== null) {
		return {
			result: value,
			updateDate: updateDate.current,
			fallback: undefined,
			reload,
			refreshControl,
		}
	}

	const fallback = errorObj ? (
		<ErrorHandler
			error={[updateTimes, errorObj]}
			reload={reload}
			name={description}
		/>
	) : (
		<Loading text={`Загрузка ${description}{dots}`} />
	)

	// No value, return fallback element
	return {
		result: undefined,
		updateDate: undefined,
		fallback,
		reload,
		refreshControl,
	}
}


