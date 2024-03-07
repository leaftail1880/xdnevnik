import { action, makeObservable, observable, runInAction } from 'mobx'
import Toast from 'react-native-toast-message'
import { Logger } from '../Setup/constants'
import { makeReloadPersistable } from '../Stores/makePersistable'
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
} from './classes'
import { ROUTES } from './routes'

// Common request options
interface StudentId {
	studentId: number
}

interface StudentAndYear extends StudentId {
	schoolYearId: number
}

// Request interface
type Primitive = string | number | boolean | null | undefined

interface ReqInit extends RequestInit {
	auth?: boolean
	params?: Record<string, Primitive | Primitive[]> | [Primitive, Primitive][]
}

/**
 * Main error class.
 */
export class NetSchoolError extends Error {
	public cacheGuide = false
	public beforeAuth = false
	public canIgnore = false
	public constructor(
		message: string,
		options?: {
			cacheGuide?: boolean
			beforeAuth?: boolean
			canIgnore?: boolean
		}
	) {
		super(message)
		if (options) {
			this.cacheGuide = options.cacheGuide ?? false
			this.beforeAuth = options.beforeAuth ?? false
			this.canIgnore = options.canIgnore ?? false
		}
	}
}

/**
 * Main api class.
 */
export class NetSchoolApi {
	static noConnection = 'Нет сети.' as const
	static stringifyError(
		e: object
	): string | (typeof NetSchoolApi)['noConnection'] {
		let result = ''
		if (
			e instanceof TypeError &&
			e.message.includes('Network request failed')
		) {
			result = this.noConnection
		} else if (e instanceof Error && e.name === 'AbortError') {
			result =
				'Нет ответа от сервера. Плохой интернет или сетевой город на техработах'
		} else {
			result = e + ''
		}

		result = result.replace(/^Error: /, '')

		return result
	}
	static async fetchEndpoints() {
		const result = await fetch(ROUTES.getEndPointsList)
			.then<RawEndpoints>(res => res.json())
			.then<Endpoint[]>(res =>
				res.items
					.filter(e => !e.demo && !/demo/i.test(e.name))
					.map(e => {
						return { name: e.name, url: e.url }
					})
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
			cache: observable,
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
			],
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
	setEndpoint(b: string) {
		if (!b) return
		const url = new URL(b)
		this.endpoint = b
		this.origin = url.origin
		this.base = url.pathname
	}
	private origin = ''
	private base = '/api/mobile'

	public async logOut() {
		this.session = null
		this.authorized = null
		this.setEndpoint('')
	}

	public async getToken(
		form: Record<string, string>,
		error400: string = 'Неверный токен для входа, перезайдите. Ошибка 400'
	) {
		Logger.debug({
			expires: this.session?.expires.toReadable(),
			today: new Date().toReadable(),
			form,
		})
		const response = await fetch(ROUTES.getToken, {
			method: 'POST',
			body: new URLSearchParams(form).toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		})

		Logger.debug({ status: response.status })
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
						Date.now() + 1000 * parseInt(json.expires_in || '0', 10) - 7000
					),
				}

				this.authorized = true
			})
		} else
			throw new NetSchoolError(
				'Запрос токена не удался, код ошибки ' + response.status
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
				path.endsWith('/') || i + 1 === a.length ? path : `${path}/`
			)
			.join('')
	}

	async request<T extends object | null | undefined>(
		url: string,
		init: ReqInit = {},
		fetchFn: (
			url: string,
			init: RequestInit
		) => Promise<{ status: number; ok: boolean; json(): Promise<T> }> = fetch
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
				init.params as unknown as [string, string][]
			).toString()
		}

		try {
			if (init.auth) {
				if (this.session && this.session.expires.getTime() < Date.now()) {
					Logger.debug(
						'Session expired',
						this.session.expires.toReadable(),
						new Date().toReadable()
					)
					// Request update of token
					this.authorized = null
				}

				if (!this.session || !this.authorized) {
					throw new NetSchoolError('Запрос к ' + url, {
						cacheGuide: true,
						beforeAuth: true,
					})
				} else {
					request.headers[
						'Authorization'
					] = `Bearer ${this.session.access_token}`
				}
			}

			const signal = AbortSignal.timeout(this.timeoutLimit * 1000)
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
					{ cacheGuide: true }
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
				const beforeAuth = error instanceof NetSchoolError && error.beforeAuth
				const errText = beforeAuth ? '' : 'error: ' + error

				if (!beforeAuth) {
					Toast.show({
						type: 'error',
						text1: 'Ошибка',
						text2: NetSchoolApi.stringifyError(error),
					})
				}
				Logger.debug('Using cache for', url.replace(this.origin, ''), errText)
				return this.cache[url][1] as T
			} else if (error instanceof NetSchoolError && error.cacheGuide) {
				throw new NetSchoolError(
					this.errorReasons.HowToCache + ' ' + error.message,
					{ beforeAuth: error.beforeAuth, canIgnore: true }
				)
			} else throw error
		}
	}

	private errorReasons = {
		401: 'Недостаточно прав или ошибка авторизации.',
		404: 'Дневник обновился или указан неправильный путь запроса. Сообщите об ошибке разработчику',

		500: 'Ошибка на стороне сервера дневника. Возможно, неправильный запрос',
		503: 'Сервер дневника недоступен, технические работы.',

		HowToCache: 'Авторизируйтесь чтобы этот экран стал доступен.',
	}

	private async get<T extends object>(
		url: string,
		init?: Omit<ReqInit, 'method'>
	) {
		return this.request<T>(url, { auth: true, ...init, method: 'GET' })
	}

	public async students() {
		return this.get<Student[]>(ROUTES.students)
	}

	public async education({ studentId }: StudentId) {
		return this.get<Education[]>(ROUTES.education, {
			params: { studentId },
		})
	}

	public async diary({
		studentId,
		startDate,
		endDate,
	}: StudentId & {
		startDate: string
		endDate: string
	}) {
		return new Diary(
			await this.get(ROUTES.classmeetings, {
				params: {
					studentIds: [studentId],
					startDate: startDate,
					endDate: endDate,
					extraActivity: null,
				},
			})
		)
	}

	public async attachments({
		studentId,
		assignmentIds,
	}: StudentId & { assignmentIds: number[] }) {
		return this.get<Attachment[]>(ROUTES.attachments, {
			params: [
				['studentId', studentId],
				...assignmentIds.map(e => ['assignmentId', e] as [string, number]),
			],
		})
	}

	public async assignment({
		studentId,
		assignmentId,
	}: StudentId & { assignmentId: number }) {
		return this.get<Assignment>(`${ROUTES.assignments}/${assignmentId}`, {
			params: {
				studentId,
			},
		})
	}

	public async assignments({
		studentId,
		classmeetingsIds,
	}: StudentId & { classmeetingsIds: number[] }) {
		return this.get<Assignment[]>(ROUTES.assignments, {
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
	}: StudentId & {
		withoutMarks?: boolean
		withExpiredClassAssign?: boolean
	}) {
		return this.get<Assignment[]>(ROUTES.assignmentsForCurrentTerm, {
			params: {
				studentId,
				withoutMarks: withoutMarks ?? true,
				withExpiredClassAssign: withExpiredClassAssign ?? false,
			},
		})
	}

	public async subjects({ studentId, schoolYearId }: StudentAndYear) {
		return this.get<Subject[]>(ROUTES.subjects, {
			params: { studentId, schoolYearId },
		})
	}

	public async subjectPerformance({
		studentId,
		subjectId,
		termId,
	}: StudentId & { subjectId: number; termId?: number }) {
		return this.get<SubjectPerformance>(ROUTES.subjectPerformance, {
			params: {
				studentId,
				subjectId,
				termId,
			},
		})
	}

	public async totals({ studentId, schoolYearId }: StudentAndYear) {
		const totals: Total[] = await this.get<Total[]>(ROUTES.totals, {
			params: {
				studentId,
				schoolYearId,
			},
		})
		return totals.map(total => {
			runInAction(() => {
				total.termTotals = total.termTotals.sort(
					(a, b) => parseInt(a.term.name) - parseInt(b.term.name)
				)

				if (total.termTotals.length < 4) {
					total.termTotals.length = 4
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
					visitedIds.has(e.period.id) ? false : visitedIds.add(e.period.id)
				)
			})

			return total
		})
	}
}

export const API = new NetSchoolApi()
