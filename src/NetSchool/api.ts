import AsyncStorage from '@react-native-async-storage/async-storage'
import { URL, URLSearchParams } from 'react-native-url-polyfill'
import { LOGGER } from '../constants'
import {
	AssignmentForCurrentTerm as Assignment,
	Diary,
	Education,
	Endpoint,
	RawEndpoints,
	ReactStateHook,
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
class NetSchoolError extends Error {
	public cacheGuide = false
	public constructor(message: string, options?: { cacheGuide: boolean }) {
		super(message)
		if (options) {
			this.cacheGuide = options.cacheGuide
		}
	}
}

/**
 * Main api class.
 */
export class NetSchoolApi {
	public static async fetchEndpoints() {
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

	private _cache: Record<string, [number, object]> = {}
	/**
	 * Cache to store responses to work in offline mode
	 */
	public get cache() {
		return this._cache
	}
	public set cache(value) {
		this._cache = value

		// Update all react effects
		this.updateEffects++
	}

	/**
	 * Used to link react state with class prop
	 */
	public hookReactState([state, setState]: ReturnType<
		typeof import('react').useState<ReactStateHook>
	>) {
		Object.defineProperties(this, {
			updateEffects: {
				get() {
					return state?.updateEffects ?? 0
				},
				set(v: number) {
					setState({ ...state!, updateEffects: v })
				},
			},
			authorized: {
				set(v: null | true) {
					setState({ ...state!, authorized: v })
				},
				get() {
					return state?.authorized ?? null
				},
			},
		})
	}
	public authorized: null | true = null
	public updateEffects = 0

	public session: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		access_token: string
		// eslint-disable-next-line @typescript-eslint/naming-convention
		refresh_token: string
		expires: Date
	} | null = null
	private origin = ''
	private base = '/api/mobile'

	public constructor(endpoint?: string) {
		if (endpoint) this.setEndpoint(endpoint)
	}

	public setEndpoint(endpoint: string) {
		const url = new URL(endpoint)
		this.origin = url.origin
		this.base = url.pathname

		// Mark react effects who depend on endpoint changes
		if (this.authorized) this.updateEffects++
	}

	public async getToken(
		form: Record<string, string>,
		error400: string = 'Неверные данные для входа'
	) {
		const response = await fetch(ROUTES.getToken, {
			method: 'POST',
			body: new URLSearchParams(form).toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		})

		if (response.status === 400) {
			throw new NetSchoolError(error400)
		}

		if (response.ok) {
			const json = await response.json()
			this.session = {
				access_token: json.access_token || '',
				refresh_token: json.refresh_token || '',
				expires: new Date(
					Date.now() + 1000 * parseInt(json.expires_in || '0', 10) - 7000
				),
			}
			this.authorized = true

			return this.session
		} else
			throw new NetSchoolError(
				'Запрос токена не удался, код ошибки ' + response.status
			)
	}

	public restoreSessionFromMemory(
		session: NonNullable<NetSchoolApi['session']>
	) {
		session.expires = new Date(session.expires)
		this.session = session
		this.updateEffects++
	}

	public async refreshTokenIfExpired(onError: (e: Error) => void) {
		if (this.session) {
			if (this.session.expires.getTime() - 1000 * 60 < Date.now()) {
				LOGGER.info(
					this.session.expires.toLocaleTimeString(),
					new Date().toLocaleTimeString()
				)
				try {
					await this.getToken(
						ROUTES.refreshTokenTemplate(this.session.refresh_token),
						'Зайдите в приложение заново.'
					)
				} catch (error) {
					onError(error)
				}
			} else {
				if (!API.authorized) API.authorized = true
			}
		}
	}

	public logOut() {
		this.session = null
		this.authorized = null
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

	public async request<T>(url: string, init: ReqInit = {}): Promise<T> {
		const request: RequestInit & Required<Pick<RequestInit, 'headers'>> = {
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
				if (!this.session || !this.authorized) {
					throw new NetSchoolError('Запрос к ' + url + ' до авторизации.', {
						cacheGuide: true,
					})
				} else {
					request.headers[
						'Authorization'
					] = `Bearer ${this.session.access_token}`
				}
			}

			const response = await fetch(url, { ...init, ...request })

			if (response.status === 503)
				throw new NetSchoolError(this.errorReasons[503], {
					cacheGuide: true,
				})

			if (!response.ok) {
				const error = new NetSchoolError(
					`${this.errorReasons[response.status]}\nКод ошибки сервера: ${
						response.status
					}`,
					{ cacheGuide: true }
				)
				LOGGER.error(error + ' Auth ' + !!init.auth)
				throw error
			}

			const json = await response.json()
			this.cache[url] = [Date.now(), json]
			AsyncStorage.setItem('cache', JSON.stringify(this.cache))

			return json
		} catch (error) {
			if (this.cache[url]) {
				LOGGER.error(
					'using cache for',
					url.replace(this.origin, '') + ', error',
					error
				)
				return this.cache[url][1] as T
			} else if (error instanceof NetSchoolError && error.cacheGuide) {
				throw new NetSchoolError(
					error.message + ' ' + this.errorReasons.HowToCache
				)
			} else throw error
		}
	}

	private errorReasons = {
		401: 'Недостаточно прав или ошибка авторизации.',
		404: 'Дневник обновился или указан неправильный путь запроса. Сообщите об ошибке разработчику',

		503: 'Сервер дневника недоступен, технические работы.',

		HowToCache:
			'Зайдите в приложение и откройте этот экран чтобы кэш стал доступен',
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
		startDate?: string
		endDate?: string
	}) {
		return new Diary(
			await this.get(ROUTES.classmeetings, {
				params: {
					studentIds: [studentId],
					startDate: startDate ?? Date.week[0],
					endDate: endDate ?? Date.week[6],
					extraActivity: null,
				},
			})
		)
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
		classsmetingsIds,
	}: StudentId & { classsmetingsIds: number[] }) {
		return this.get<Assignment[]>(ROUTES.assignments, {
			params: [
				['studentId', studentId],
				...classsmetingsIds.map(e => ['classmeetingId', e] as [string, number]),
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
		return (
			await this.get<Total[]>(ROUTES.totals, {
				params: {
					studentId,
					schoolYearId,
				},
			})
		).map(total => {
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

			return total
		})
	}
}

export const API = new NetSchoolApi()
