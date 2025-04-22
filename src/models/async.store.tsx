import ErrorHandler from '@/components/ErrorHandler'
import Loading from '@/components/Loading'
import {
	CacheUsed,
	CacheableReq,
	API as NSApi,
	NetSchoolError,
} from '@/services/net-school/api'
import {
	action,
	autorun,
	makeAutoObservable,
	observable,
	reaction,
	toJS,
} from 'mobx'
import { RefreshControl } from 'react-native'
import { Logger } from '../constants'

export type AsyncMethod = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	arg: Record<string, any> & CacheableReq,
) => Promise<unknown>

/**
 * Selects only accepted api methods
 */
export type FunctionsFromObject<O extends object> = FilterObject<O, AsyncMethod>

/**
 * Return type of the useAPI hook
 */
export type AsyncState<Result> = (
	| { result: Result; fallback: undefined }
	| { result: undefined; fallback: React.JSX.Element }
) & {
	reload: () => void
	refreshControl: React.JSX.Element
	updateDate: string
}

/**
 * Different from Partial<T> is that it requires to define ALL keys
 * but any of them can be undefined
 */
type Optional<T> = { [Key in Exclude<keyof T, symbol>]: T[Key] | undefined }

export type AdditionalDeps = (
	| object
	| null
	| undefined
	| string
	| boolean
	| number
)[]

const firstTimeCacheUsedFor = new Set<string>()

export class AsyncStore<
	Source extends object,
	MethodName extends keyof FunctionsFromObject<Source>,
	Fn = FunctionsFromObject<Source>[MethodName],
	FnReturn = Fn extends AsyncMethod ? Awaited<ReturnType<Fn>> : never,
	FnParams = Fn extends AsyncMethod ? Optional<Parameters<Fn>[0]> : never,
	DefaultParams = Record<'', never>,
> {
	constructor(
		// eslint-disable-next-line @typescript-eslint/naming-convention
		private readonly API: Source,
		private readonly method: MethodName,
		public readonly name: string,
		private readonly defaultParams?: DefaultParams,
		private readonly additionalDeps: () => AdditionalDeps = () => [
			NSApi.session,
			NSApi.reload,
		],
		public debug = false,
		private readonly skipErrorMessages = false,
	) {
		this.log('Store created')

		makeAutoObservable<
			this,
			| 'reload'
			| 'reloadTimes'
			| 'resultCache'
			| 'update'
			| 'error'
			| 'loading'
			| 'params'
			| 'method'
			| 'API'
			| 'log'
			| 'refreshControlLoadingOverride'
		>(
			this,
			{
				reload: true,
				reloadTimes: true,
				resultCache: true,
				result: true,
				updateDate: true,
				refreshControl: true,
				fallback: true,
				update: true,
				error: observable.ref,
				params: observable.struct,
				withParams: action,
				loading: true,
				refreshControlLoadingOverride: true,
				log: false,
				debug: false,
				name: false,
				method: false,
				API: false,
			},
			{ autoBind: true, name: this.name },
		)

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const store = this

		// Reload on reload request
		autorun(function apiStoreReload() {
			store.update(toJS(store.params))
		})

		reaction(
			() => this.additionalDeps(),
			() => this.update(this.params),
		)
	}

	private log(...data: unknown[]) {
		if (this.debug) {
			Logger.debug('\u001b[36mДля ' + this.name + '\u001b[0m', ...data)
		}
	}

	private reload() {
		this.log('Reloading')
		this.reloadTimes++
		this.update(this.params)
	}

	private error: Error | undefined = undefined
	private loading = true
	private reloadTimes: number = 0
	private params: FnParams | undefined = undefined

	private resultCache: FnReturn | undefined = undefined
	get result() {
		if (this.loading) return undefined
		return this.resultCache
	}
	set result(v) {
		this.resultCache = v
	}

	updateDate = 'Загрузка...'

	private refreshControlLoadingOverride = true
	get refreshControl() {
		return (
			<RefreshControl
				refreshing={this.refreshControlLoadingOverride || this.loading}
				onRefresh={this.reload}
			/>
		)
	}

	get fallback() {
		const noResult = typeof this.result === 'undefined'
		if (this.loading || noResult) {
			return this.error && noResult ? (
				<ErrorHandler
					error={[this.reloadTimes, this.error]}
					reload={this.reload}
					name={this.name}
				/>
			) : (
				<Loading text={`Загрузка ${this.name}...`} />
			)
		}
	}

	withParams(
		params: Omit<
			FnParams,
			keyof DefaultParams | 'cache' | 'skipErrorMessages' | 'store'
		>,
	) {
		this.log('Changing params from', this.params, 'to', params)
		// @ts-expect-error Type infering
		this.params = params
	}

	private *update(params: FnParams | undefined) {
		this.log(
			'Request update, params:',
			params,
			'\ndefault params:',
			this.defaultParams,
		)

		// Something wrong with types
		const request = this.API[this.method]
		if (typeof request !== 'function') {
			Logger.warn(
				'Method ' +
					(typeof this.method === 'symbol'
						? 'Symbol::' + this.method.description
						: (this.method as string)) +
					' of api is not a function!',
			)
			return
		}

		if (this.defaultParams)
			params = { ...this.defaultParams, ...params } as FnParams

		if (!params) {
			this.log('no params!!!')
			return
		}
		this.log('Params', params)

		const deps = Object.values(params).concat(this.additionalDeps())
		this.log('deps', deps)

		// Some of the params arent loaded, skipping...
		if (deps.some(e => typeof e === 'undefined' || e === null)) {
			this.log(
				'Undefined values in params, additional ' + this.additionalDeps(),
			)
			return
		}

		const key = String(this.method) + '-' + JSON.stringify(params)

		// Only force load from cache on the first request
		const cache: CacheUsed | undefined = firstTimeCacheUsedFor.has(key)
			? undefined
			: { isUsed: false }

		try {
			this.result = yield request.call(this.API, {
				...params,
				cache,
				skipErrorMessages: this.skipErrorMessages,
				store: this.name,
			})
			this.updateDate = `Дата обновления: ${new Date().toLocaleTimeString()}`

			if (cache?.isUsed) {
				this.refreshControlLoadingOverride = true
				this.reload()
			} else if (this.refreshControlLoadingOverride) {
				this.refreshControlLoadingOverride = false
			}

			this.log(
				'Loaded, first time cache expected',
				!firstTimeCacheUsedFor.has(key),
				cache,
				'used',
				cache?.isUsed,
			)
		} catch (error) {
			const canIgnore =
				(error instanceof Error && error.message === 'Aborted') ||
				(error instanceof NetSchoolError && error.loggerIgnore)

			if (!canIgnore) {
				Logger.error(
					'Failed to update для',
					this.name,
					error instanceof Error ? error.stack : error,
				)
			}

			this.error = error
		} finally {
			this.loading = false
			firstTimeCacheUsedFor.add(key)
		}
	}
}
