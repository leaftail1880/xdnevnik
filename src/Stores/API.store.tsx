import {
	autorun,
	makeObservable,
	observable,
	reaction,
	runInAction,
} from 'mobx'
import { RefreshControl } from 'react-native'
import { ErrorHandler } from '../Components/ErrorHandler'
import { Loading } from '../Components/Loading'
import { API as NSApi, NetSchoolError } from '../NetSchool/api'
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
	| { result: Result; updateDate: string; fallback: undefined }
	| { result: undefined; updateDate: undefined; fallback: React.JSX.Element }
) & { reload: () => void; refreshControl: React.JSX.Element }

/**
 * Different from Partial<T> is that it requires to define ALL keys
 * but any of them can be undefined
 */
type Optional<T> = { [Key in Exclude<keyof T, symbol>]: T[Key] | undefined }

type AdditionalDeps = (object | null | undefined | string | boolean | number)[]

export class APIStore<
	APISource extends object,
	APIMethodName extends keyof FunctionsFromObject<APISource>,
	Fn = FunctionsFromObject<APISource>[APIMethodName],
	FnReturn = Fn extends APIMethod ? Awaited<ReturnType<Fn>> : never,
	FnParams = Fn extends APIMethod ? Optional<Parameters<Fn>[0]> : never,
	DefaultParams extends object = object
> {
	public debug = false
	constructor(
		// eslint-disable-next-line @typescript-eslint/naming-convention
		private readonly API: APISource,
		private readonly method: APIMethodName,
		public readonly name: string,
		private readonly defaultParams?: DefaultParams,
		private additionalDeps: () => AdditionalDeps = () => [
			NSApi.session,
			NSApi.reload,
			this.reloadTimes,
		]
	) {
		makeObservable<
			this,
			| 'reload'
			| 'error'
			| 'loading'
			| 'reloadTimes'
			| 'params'
			| 'result'
			| 'updateDate'
			| 'refreshControl'
			| 'update'
		>(
			this,
			{
				withParams: false,
				withoutParams: false,
				reload: true,
				error: observable.ref,
				loading: false,
				reloadTimes: true,
				params: observable.struct,
				result: true,
				updateDate: true,
				refreshControl: false,
				update: true,
				debug: false,
			},
			{ autoBind: true }
		)

		// Initial run
		if (this.debug) logger.debug('API store created для ' + this.name)
		this.update(this.params)

		// Reload on reload request
		autorun(() => {
			this.update(this.params)
		})

		// Reload on reload request
		reaction(
			() => this.additionalDeps(),
			() => this.update(this.params)
		)
	}

	private reload() {
		this.reloadTimes++
		this.update(this.params)
	}

	private error: Error | undefined = undefined
	private loading = true
	private reloadTimes: number = 0
	private params: FnParams | undefined = undefined
	private result: FnReturn | undefined = undefined
	private updateDate = 'Загрузка...'
	private get refreshControl() {
		return <RefreshControl refreshing={this.loading} onRefresh={this.reload} />
	}

	withParams(params: Omit<FnParams, keyof DefaultParams>) {
		runInAction(() => {
			// @ts-expect-error Type infering
			this.params = params
		})
		return this.withoutParams()
	}

	withoutParams(): APIState<FnReturn> {
		if (this.loading || typeof this.result === 'undefined') {
			return {
				fallback:
					this.error && typeof this.result === 'undefined' ? (
						<ErrorHandler
							error={[this.reloadTimes, this.error]}
							reload={this.reload}
							name={this.name}
						/>
					) : (
						<Loading text={`Загрузка ${this.name}{dots}`} />
					),
				refreshControl: this.refreshControl,
				reload: this.reload,
				result: undefined,
				updateDate: undefined,
			}
		}

		return {
			fallback: undefined,
			refreshControl: this.refreshControl,
			reload: this.reload,
			result: this.result,
			updateDate: this.updateDate,
		}
	}

	private *update(params: FnParams | undefined) {
		if (this.debug) logger.debug('Request update для ' + this.name)

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

		if (this.debug) logger.debug('Params для ' + this.name, params)
		if (!params) {
			return
		}

		// Some of the params arent loaded, skipping...
		const deps = Object.values(params).concat(this.additionalDeps)
		if (deps.some(e => typeof e === 'undefined' || e === null)) {
			if (this.debug)
				logger.warn(
					'Undefined params для ' + this.name,
					'additional ' + this.additionalDeps
				)
			return
		}

		try {
			this.result = yield request.call(this.API, params)
			this.updateDate = `Дата обновления: ${new Date().toLocaleTimeString()}`
			this.loading = false
			if (this.debug) logger.debug('Loaded для ' + this.name)
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
