import { useEffect, useState } from 'react'
import { Loading } from './loading'

interface AsyncBase<T> {
	/**
	 * {dots} can be used to set loading dots
	 */
	loading?: string
	then(value: T): React.ReactNode
	catch?(error: Error): React.ReactNode
}

interface AsyncFromPromise<T> extends AsyncBase<T> {
	promise: () => Promise<T>
	deps?: React.DependencyList
}

type AsyncProps<T> = AsyncFromPromise<T> | AsyncBase<T>

export function Async<T>(props: AsyncProps<T>) {
	const [value, setValue] = useState<T>()
	const [error, setError] = useState<Error>()

	if ('promise' in props) {
		useEffect(() => {
			props.promise().then(setValue).catch(setError)
		}, props.deps ?? [])
	}

	if (error) return props.catch(error) ?? 'Ошибка ' + error.message
	if (value) return props.then(value)
	return <Loading text={props.loading} />
}
