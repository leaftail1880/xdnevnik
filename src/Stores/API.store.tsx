import {
	action,
	autorun,
	makeAutoObservable,
	observable,
	reaction,
	toJS,
} from 'mobx'
import { RefreshControl } from 'react-native'
import { ErrorHandler } from '../Components/ErrorHandler'
import { Loading } from '../Components/Loading'
import { API, API as NSApi, NetSchoolError } from '../NetSchool/api'
import { logger } from '../constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type APIMethod = (arg: Record<string, any>) => Promise<any>

/**
 * A way to select only accepted api methods
 */
type FunctionsFromObject<O> = {
	[Key in keyof O]: O[Key] extends APIMethod ? O[Key] : never
}

/**
 * Return type of the useAPI hook
 */
export type APIState<Result> = (
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

type AdditionalDeps = (object | null | undefined | string | boolean | number)[]

export function createApiMethodStore<
	APIMethodName extends keyof FunctionsFromObject<typeof API>,
	Fn = FunctionsFromObject<typeof API>[APIMethodName],
	FnReturn = Fn extends APIMethod ? Awaited<ReturnType<Fn>> : never,
	FnParams = Fn extends APIMethod ? Optional<Parameters<Fn>[0]> : never,
	DefaultParams extends Partial<FnParams> = object
>(
	method: APIMethodName,
	name: string,
	defaultParams?: DefaultParams,
	additionalDeps?: () => AdditionalDeps,
	debug?: boolean
) {
	const store = new APIStore(
		API,
		method,
		name,
		// @ts-expect-error Uh huh
		defaultParams,
		additionalDeps,
		debug
	)
	return store as unknown as APIState<FnReturn> &
		Pick<typeof store, 'withParams'>
}

export class APIStore<
	APISource extends object,
	APIMethodName extends keyof FunctionsFromObject<APISource>,
	Fn = FunctionsFromObject<APISource>[APIMethodName],
	FnReturn = Fn extends APIMethod ? Awaited<ReturnType<Fn>> : never,
	FnParams = Fn extends APIMethod ? Optional<Parameters<Fn>[0]> : never,
	DefaultParams extends Partial<FnParams> = object
> {
	log(...data: unknown[]) {
		if (this.debug)
			logger.debug('\u001b[36mДля ' + this.name + '\u001b[0m', ...data)
	}
	constructor(
		// eslint-disable-next-line @typescript-eslint/naming-convention
		private readonly API: APISource,
		private readonly method: APIMethodName,
		public readonly name: string,
		private readonly defaultParams?: DefaultParams,
		private readonly additionalDeps: () => AdditionalDeps = () => [
			NSApi.session,
			NSApi.reload,
			this.reloadTimes,
		],
		public debug = false
	) {
		// Initial run
		logger.debug('API store created для ' + this.name)

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
				state: false,
				log: false,
				debug: false,
				name: false,
				method: false,
				API: false,
			},
			{ autoBind: true }
		)

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const store = this

		// Reload on reload request
		autorun(function apiStoreReload(r) {
			if (store.debug) r.trace(false)
			store.update(toJS(store.params))
		})

		reaction(
			() => this.additionalDeps(),
			() => this.update(this.params)
		)
	}

	private reload() {
		this.log('RELOADING ДЛЯ ' + this.name)
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

	get refreshControl() {
		return <RefreshControl refreshing={this.loading} onRefresh={this.reload} />
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
				<Loading text={`Загрузка ${this.name}{dots}`} />
			)
		}
	}

	withParams(params: Omit<FnParams, keyof DefaultParams>) {
		this.log('Changing params from', this.params, 'to', params)
		// @ts-expect-error Type infering
		this.params = params
	}

	state(): APIState<FnReturn> {
		// @ts-expect-error Uh huh
		return this
	}

	private *update(params: FnParams | undefined) {
		this.log('Request update')

		// Something wrong with types
		const request = this.API[this.method]
		if (typeof request !== 'function') {
			logger.warn(
				'Method ' +
					(typeof this.method === 'symbol'
						? 'Symbol::' + this.method.description
						: (this.method as string)) +
					' of api is not a function!'
			)
			return
		}

		if (this.defaultParams)
			params = { ...this.defaultParams, ...params } as FnParams

		if (!params) {
			this.log('undefined params object')
			return
		}
		this.log('Params', params)

		// Some of the params arent loaded, skipping...
		const deps = Object.values(params).concat(this.additionalDeps())
		this.log('deps', deps)

		if (deps.some(e => typeof e === 'undefined' || e === null)) {
			this.log('Undefined params', 'additional ' + this.additionalDeps())
			return
		}

		try {
			this.result = yield request.call(this.API, params)
			this.updateDate = `Дата обновления: ${new Date().toLocaleTimeString()}`
			this.loading = false
			this.log('Loaded')
		} catch (error) {
			const canIgnore = error instanceof NetSchoolError && error.canIgnore

			if (!canIgnore) {
				logger.error(
					'Failed to update для',
					this.name,
					error instanceof Error ? error.stack : error
				)
			}

			this.error = error
		}
	}
}
