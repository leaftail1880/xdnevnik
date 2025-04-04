import { Logger } from '@/constants'
import {
	abortSignalTimeout,
	RequestError,
	RequestErrorOptions,
} from '@/utils/RequestError'
import { Toast } from '@/utils/Toast'
import { makeReloadPersistable } from '@/utils/makePersistable'
import { action, autorun, makeObservable, observable, runInAction } from 'mobx'
import {
	Assignment,
	Attachment,
	Diary,
	Education,
	Endpoint,
	RawEndpoints,
	Student,
	Subject,
	SubjectPerformance,
	Total,
} from './entities'
import { ROUTES } from './routes'

// TODO! WARNING This code can cause anxiety
// TODO Create separated HttpSessionAgent class with cache support and leave here only
// TODO Api implemenation

// after trying to refactor i decided to leave it as is, because normal refactor would take too much time writing tests,
// separating logic and then rewriting most of it... so... here we go? Very, VERY bad network/state managmenet code

// the main problem is that the code is already split between here and the async store
// and that there is still some state and the functions aren't pure

if (!__TEST__) setTimeout(() => import('./session'), 2000)

Promise.withResolvers ??= <T>() => {
	const result: Partial<PromiseWithResolvers<T>> = {}
	const promise = new Promise<T>((res, rej) => {
		result.resolve = res
		result.reject = rej
	})
	result.promise = promise

	return result as PromiseWithResolvers<T>
}
let authWaiter: PromiseWithResolvers<void> | undefined = Promise.withResolvers()

/**
 * Used as indicator to use cache for the first request at the async store
 */
export interface CacheUsed {
	isUsed: boolean
}

export interface CacheableReq {
	cache?: CacheUsed
}

// Common request options
interface StudentId extends CacheableReq {
	studentId: number
}

interface StudentAndYear extends StudentId {
	schoolYearId: number
}

// Request interface
type Primitive = string | number | boolean | null | undefined

interface ReqInit extends RequestInit, CacheableReq {
	auth?: boolean
	params?: Record<string, Primitive | Primitive[]> | [Primitive, Primitive][]
}

/**
 * Main error class.
 */
export class NetSchoolError extends RequestError {
	cacheGuide = false
	useCache = false

	constructor(
		message: string,
		options?: {
			cacheGuide?: boolean
			useCache?: boolean
		} & RequestErrorOptions,
	) {
		super(message, options)
		this.useCache = !!options?.useCache
		this.cacheGuide = !!options?.cacheGuide
	}
}

/**
 * Main api class.
 */
export class NetSchoolApi {
	static async fetchEndpoints() {
		const result = await fetch(ROUTES.getEndPointsList)
			.then<RawEndpoints>(res => res.json())
			.then<Endpoint[]>(res =>
				res.items
					.filter(e => !e.demo && !/demo/i.test(e.name))
					.map(e => {
						return { name: e.name, url: e.url }
					}),
			)

		return result
	}

	/**
	 * The function "getOrigin" returns the origin of a NetSchoolApi object.
	 * @param {NetSchoolApi} api - Api to get origin from
	 */
	public static getOrigin(api: NetSchoolApi) {
		return api.origin
	}

	constructor() {
		// eslint-disable-next-line mobx/exhaustive-make-observable
		makeObservable(this, {
			cache: true,
			authorized: true,
			reload: true,
			session: observable.struct,
			request: true,
			endpoint: observable,
			logOut: action,
			setEndpoint: true,
			timeoutLimit: true,
		})
		makeReloadPersistable(this, {
			name: 'api',
			properties: [
				{
					key: 'endpoint',
					serialize: e => e,
					deserialize: e => (this.setEndpoint(e), e),
				},
				{
					key: 'cache',
					serialize: e => e,
					deserialize: e => e,
				},
				{
					key: 'session',
					serialize: s => s,
					deserialize(session) {
						if (session) session.expires = new Date(session.expires)
						return session
					},
				},
				{ key: 'timeoutLimit', serialize: e => e, deserialize: e => e },
				{
					key: 'useCacheOnMoreThenReqs',
					serialize: e => e,
					deserialize: e => e,
				},
			],
		})

		autorun(() => {
			if (this.authorized && authWaiter) {
				authWaiter.resolve()
				authWaiter = undefined
			}
		})
	}

	timeoutLimit = 5

	/**
	 * Cache to store responses to work in offline mode
	 */
	cache: Record<string, [number, object | undefined | null]> = {}
	authorized: null | true = null
	reload = 0
	session: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		access_token: string
		// eslint-disable-next-line @typescript-eslint/naming-convention
		refresh_token: string
		expires: Date
	} | null = null

	endpoint = ''
	private origin = ''
	private base = '/api/mobile'
	setEndpoint(b: string) {
		if (!b) return
		const url = new URL(b)
		this.endpoint = b
		this.origin = url.origin
		this.base = url.pathname
	}

	public async clearCache() {
		this.cache = {}
	}

	public async logOut() {
		this.session = null
		this.authorized = null
		this.setEndpoint('')
	}

	public async getToken(
		form: Record<string, string>,
		error400: string = 'Вход не удался, перезайдите.',
	) {
		Logger.debug('getToken request', {
			expires: this.session?.expires.toReadable(),
			today: new Date().toReadable(),
			form,
		})
		const response = await fetch(ROUTES.getToken, {
			method: 'POST',
			body: new URLSearchParams(form).toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		})

		Logger.debug('getToken respone', { status: response.status })
		if (response.status === 400) {
			throw new NetSchoolError(error400)
		}

		if (response.ok) {
			const json = await response.json()
			runInAction(() => {
				this.session = {
					access_token: json.access_token || '',
					refresh_token: json.refresh_token || '',
					expires: new Date(
						Date.now() + 1000 * parseInt(json.expires_in || '0', 10) - 7000,
					),
				}

				this.authorized = true
			})
		} else
			throw new NetSchoolError(
				'Ошибка ' + response.status + ' при получении токена',
			)
	}

	private isAbsolute(path: string) {
		// https://example -> true
		// /path -> false
		return /^(?:[a-z]+:)?\/\//i.test(path)
	}

	public join(...paths: string[]) {
		return [this.origin, this.base, ...paths]
			.map(path => path.replace(/^\//, ''))
			.map((path, i, a) =>
				path.endsWith('/') || i + 1 === a.length ? path : `${path}/`,
			)
			.join('')
	}

	useCacheOnMoreThenReqs = 5

	// private reqs = 0

	async request<T extends object | null | undefined>(
		url: string,
		init: ReqInit = {},
		fetchFn: (
			url: string,
			init: RequestInit,
		) => Promise<{ status: number; ok: boolean; json(): Promise<T> }> = fetch,
	): Promise<T> {
		const request: RequestInit & { headers: Record<string, string> } = {
			headers: {},
		}

		// Make relative request absolute
		if (!this.isAbsolute(url)) url = this.join(url)

		// Apply custom options
		if (init.params) {
			if (!url.endsWith('?')) url += '?'
			url += new URLSearchParams(
				init.params as unknown as [string, string][],
			).toString()
		}

		try {
			// If cache is requested, use it
			if (init.cache && url in this.cache) {
				init.cache.isUsed = true
				return this.cache[url][1] as T
			}

			if (init.auth) {
				if (this.session && this.session.expires.getTime() < Date.now()) {
					Logger.debug(
						'Session expired',
						this.session.expires.toReadable(),
						new Date().toReadable(),
					)

					// Request update of the token
					this.authorized = null
				}

				// Try to wait for the first auth
				if (authWaiter && (!this.session || !this.authorized)) {
					await authWaiter.promise
				}

				if (!this.session || !this.authorized) {
					throw new NetSchoolError('Запрос к ' + url, {
						cacheGuide: true,
						useCache: true,
					})
				} else {
					request.headers['Authorization'] =
						`Bearer ${this.session.access_token}`
				}
			}

			// this.reqs = Math.max(0, this.reqs + 1)

			const signal = abortSignalTimeout(this.timeoutLimit * 1000)
			const response = await fetchFn(url, { signal, ...init, ...request })

			if (response.status === 503)
				throw new NetSchoolError(this.errorReasons[503], {
					cacheGuide: true,
				})

			if (!response.ok) {
				const status = response.status
				const reasons = this.errorReasons
				const error = new NetSchoolError(
					`${
						status in reasons
							? reasons[status as keyof typeof reasons]
							: 'Неизвестная ошибка'
					}\nКод ошибки сервера: ${status}`,
					{ cacheGuide: true },
				)
				Logger.error(error, 'URL:', url, 'Request:', init)
				throw error
			}

			const json = await response.json()
			runInAction(() => {
				this.cache[url] = [Date.now(), json]
			})

			return json
		} catch (error) {
			if (this.cache[url]) {
				const beforeAuth = error instanceof NetSchoolError && error.useCache
				const errText = beforeAuth ? '' : 'error: ' + error

				if (!beforeAuth) {
					Toast.show({
						error: true,
						title: 'Ошибка',
						body: RequestError.stringify(error),
					})
				}

				/* istanbul ignore if */
				if (!__DEV__)
					Logger.debug('Using cache for', url.replace(this.origin, ''), errText)

				return this.cache[url][1] as T
			} else if (error instanceof NetSchoolError && error.cacheGuide) {
				throw new NetSchoolError(
					this.errorReasons.HowToCache + ' ' + error.message,
					{ useCache: error.useCache, loggerIgnore: true },
				)
			} else throw error
		} finally {
			// this.reqs = Math.max(0, this.reqs - 1)
		}
	}

	private errorReasons = {
		401: 'Недостаточно прав или другая ошибка авторизации. Попробуйте с аккаунта ученика',
		404: 'Дневник обновился или указан неправильный путь запроса. Сообщите об ошибке разработчику',

		500: 'Ошибка на стороне сервера дневника. Возможно, неправильный запрос',
		503: 'Сервер дневника недоступен, технические работы',

		HowToCache: 'Авторизируйтесь, чтобы эти данные стали доступны',
	}

	private async get<T extends object>(
		url: string,
		init?: Omit<ReqInit, 'method'>,
	) {
		return this.request<T>(url, { auth: true, ...init, method: 'GET' })
	}

	public async students(req: CacheableReq = {}) {
		return this.get<Student[]>(ROUTES.students, req)
	}

	public async education({ studentId, cache }: StudentId) {
		return this.get<Education[]>(ROUTES.education, {
			cache,
			params: { studentId },
		})
	}

	public async diary({
		studentId,
		startDate,
		endDate,
		cache,
	}: StudentId & {
		startDate: string
		endDate: string
	}) {
		return new Diary(
			await this.get(ROUTES.classmeetings, {
				cache,
				params: {
					studentIds: [studentId],
					startDate: startDate,
					endDate: endDate,
					extraActivity: null,
				},
			}),
		)
	}

	public async attachments({
		studentId,
		assignmentIds,
		cache,
	}: StudentId & { assignmentIds: number[] }) {
		return this.get<Attachment[]>(ROUTES.attachments, {
			cache,
			params: [
				['studentId', studentId],
				...assignmentIds.map(e => ['assignmentId', e] as [string, number]),
			],
		})
	}

	public async assignment({
		studentId,
		assignmentId,
		cache,
	}: StudentId & { assignmentId: number }) {
		return this.get<Assignment>(`${ROUTES.assignments}/${assignmentId}`, {
			cache,
			params: {
				studentId,
			},
		})
	}

	public async assignments({
		studentId,
		classmeetingsIds,
		cache,
	}: StudentId & { classmeetingsIds: number[] }) {
		return this.get<Assignment[]>(ROUTES.assignments, {
			cache,
			params: [
				['studentId', studentId],
				...classmeetingsIds.map(e => ['classmeetingId', e] as [string, number]),
			],
		})
	}

	public async homework({
		studentId,
		withoutMarks,
		withExpiredClassAssign,
		cache,
	}: StudentId & {
		withoutMarks?: boolean
		withExpiredClassAssign?: boolean
	}) {
		return this.get<Assignment[]>(ROUTES.assignmentsForCurrentTerm, {
			cache,
			params: {
				studentId,
				withoutMarks: withoutMarks ?? false,
				withExpiredClassAssign: withExpiredClassAssign ?? true,
			},
		})
	}

	public async subjects({ studentId, schoolYearId, cache }: StudentAndYear) {
		return this.get<Subject[]>(ROUTES.subjects, {
			cache,
			params: { studentId, schoolYearId },
		})
	}

	public async subjectPerformance({
		studentId,
		subjectId,
		termId,
		cache,
	}: StudentId & { subjectId: number; termId?: number }) {
		return this.get<SubjectPerformance>(ROUTES.subjectPerformance, {
			cache,
			params: {
				studentId,
				subjectId,
				termId,
			},
		})
	}

	public async totals({ studentId, schoolYearId, cache }: StudentAndYear) {
		const totals: Total[] = await this.get<Total[]>(ROUTES.totals, {
			cache,
			params: {
				studentId,
				schoolYearId,
			},
		})

		const maxLength = Math.max(...totals.map(e => e.termTotals.length))
		return totals.map(total => {
			runInAction(() => {
				total.termTotals = total.termTotals.sort(
					(a, b) => parseInt(a.term.name) - parseInt(b.term.name),
				)

				if (total.termTotals.length < maxLength) {
					total.termTotals.length = maxLength
					for (const [i, term] of total.termTotals.entries()) {
						total.termTotals[i] = term ?? {
							avgMark: null,
							mark: null,
							term: { id: 0, name: '0' },
						}
					}
				}

				const visitedIds = new Set<number>()
				total.yearTotals = total.yearTotals.filter(e =>
					visitedIds.has(e.period.id) ? false : visitedIds.add(e.period.id),
				)
			})

			return total
		})
	}
}

export const API = new NetSchoolApi()
