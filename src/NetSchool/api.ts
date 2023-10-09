import { URL, URLSearchParams } from 'react-native-url-polyfill'
import { ROUTES } from './routes'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Diary from './diary'

export interface NSEntity {
	id: number
	name: string
}

interface StudentId {
	studentId: number
}

interface StudentAndYear extends StudentId {
	schoolYearId: number
}

interface RawEndpoints {
	items: ({ demo: boolean } & Endpoint)[]
}

export interface Endpoint {
	name: string
	url: string
}

export interface Student {
	name: string
	shortName: string
	studentId: number
}

export interface Education {
	class: NSEntity & {
		isFree: boolean
	}
	isAddSchool: boolean
	school: NSEntity
	schoolyear: NSEntity & {
		endDate: string
		startDate: string
	}
}

export interface Subject extends NSEntity {
	order: number
	federalСurriculum: boolean
}

export interface AssignmentForCurrentTerm {
	classmeetingId: number
	assignmentId: number
	assignmentName: string
	description: any
	result: any
	classAssignment: boolean
	duty: boolean
	comment: any
	assignmentTypeId: number
	assignmentTypeAbbr: string
	assignmentTypeName: string
	weight: number
	attachmentsExists: boolean
	hasTextAnswer: boolean
	hasFileAnswers: boolean
	subjectId: number
	subjectName: string
	dueDate: string
	answerFilesCount: number
	extraActivity: boolean
	resultDate: any
	assignmentDate: string
	canAnswer: boolean
}

export interface Lesson {
	classmeetingId: number
	studentId: number
	assignmentId: number[]
	order: number
	scheduleTimeNumber: number
	scheduleTimeRelay: number
	day: string
	subjectName: string
	subjectId: number
	subjectGroupId: number
	startTime: string
	endTime: string
	teachers: NSEntity[]
	lessonTheme: string
	roomName: string
	attachmentsExists: boolean
	resultsExists: boolean
	attendance: any
	addEducation: boolean
	extraActivity: boolean
}

interface SubjectPerformance {
	subject: NSEntity
	term: NSEntity
	averageMark: number
	classAverageMark: number
	maxMark: number
	classmeetingsStats: {
		passed: number
		scheduled: number
	}
	teachers: NSEntity
	results: {
		date: string
		assignmentId: number
		classMeetingId: number
		classMeetingDate: string
		result: number
		duty: boolean
		comment: any
		weight: number
		assignmentTypeId: number
		assignmentTypeAbbr: string
		assignmentTypeName: string
	}[]
	markStats: {
		mark: number
		count: number
		fraction: number
	}[]
	attendance: []
}

interface Total {
	subjectId: number
	termTotals: {
		term: NSEntity
		mark: string | number | null
		avgMark: number
	}[]
	yearTotals: {
		period: {
			id: number
			periodName: string
			periodType: string
		}
		mark: string | number | null
	}[]
}

interface ReqInit extends RequestInit {
	auth?: boolean
	params?: Record<string, any>
}

export default class NetSchoolApi {
	static async getEndpoints() {
		return fetch(ROUTES.getEndPointsList)
			.then<RawEndpoints>(res => res.json())
			.then<Endpoint[]>(res =>
				res.items
					.filter(e => !e.demo && !/demo/i.test(e.name))
					.map(e => {
						return { name: e.name, url: e.url }
					})
			)
	}

	static getOrigin(api: NetSchoolApi) {
		return api.origin
	}

	private _cache: Record<string, [number, any]> = {}
	get cache() {
		return this._cache
	}
	set cache(value) {
		// Update all react effects
		this.changes++
		this._cache = value
	}

	public loggedIn = false
	public changes = 0

	private session = {
		access_token: '',
		refresh_token: '',
		expires: new Date(),
	}
	private origin = ''
	private base = '/api/mobile'

	constructor(endpoint?: string) {
		if (endpoint) this.setEndpoint(endpoint)
	}

	public setEndpoint(endpoint: string) {
		const url = new URL(endpoint)
		this.origin = url.origin
		this.base = url.pathname
		// Update all react effects
		if (this.loggedIn) this.changes++
	}

	private isAbsolute(path: string) {
		// http://example -> true
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
		const request: RequestInit = { headers: {} }

		// Make relative request absolute
		if (!this.isAbsolute(url)) url = this.join(url)

		// Apply custom options
		if (init.params) {
			if (!url.endsWith('?')) url += '?'
			url += new URLSearchParams(init.params).toString()
		}

		if (init.auth) {
			if (!this.session.access_token) throw new Error('Unauthorized!')
			request.headers['Authorization'] = `Bearer ${this.session.access_token}`
		}

		let response: Response | null
		try {
			response = await fetch(url, { ...init, ...request })
		} catch (error) {
			if (this.cache[url]) {
				return this.cache[url][1]
			}
		}
		if (response && !response.ok) {
			const error = new Error(
				`${this.getErrorReason(response.status)}\nКод ошибки сервера: ${
					response.status
				}`
			)
			console.error(
				`NetSchoolFetch failed with status ${response.status} URL: ${url}. Auth: ${init.auth}`
			)
			throw error
		}

		const json = await response.json()
		this.cache[url] = [Date.now(), json]
		AsyncStorage.setItem('cache', JSON.stringify(this.cache))

		return json
	}

	private getErrorReason(code: number) {
		return {
			503: 'Сервер дневника недоступен, технические работы. Загрузка данных из кэша...',
			401: 'Недостаточно прав или ошибка авторизации',
			404: 'Дневник обновился или указан неправильный путь запроса. Создайте сообщение об ошибке',
		}[code]
	}

	async get<T extends {}>(url: string, init?: Omit<ReqInit, 'method'>) {
		return this.request<T>(url, { auth: true, ...init, method: 'GET' })
	}

	async getToken(form: Record<string, string>) {
		const response = await fetch(ROUTES.getToken, {
			body: new URLSearchParams(form).toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
		})

		if (response.status === 400) {
			throw new Error('Неверные логин/пароль или устарел токен')
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
			this.loggedIn = true
			this.changes++

			return this.session
		} else
			throw new Error(
				'Запрос токена не удался ' + response.status + ' ' + response.statusText
			)
	}

	async logOut() {
		this.session = {
			access_token: '',
			refresh_token: '',
			expires: new Date(),
		}
		this.loggedIn = false
		this.changes = 0
	}

	async students() {
		return this.get<Student[]>(ROUTES.students)
	}

	async education({ studentId }: StudentId) {
		return this.get<Education[]>(ROUTES.education, {
			params: { studentId },
		})
	}

	async diary({
		studentId,
		startDate,
		endDate,
	}: StudentId & {
		startDate?: string
		endDate?: string
	}) {
		return new Diary(
			await this.get<Lesson[]>(ROUTES.classmeetings, {
				params: {
					studentIds: [studentId],
					startDate: startDate ?? Date.week[0],
					endDate: endDate ?? Date.week[6],
					extraActivity: null,
				},
			})
		)
	}

	async assignmentForCurrentTerm({
		studentId,
		withoutMarks,
		withExpiredClassAssign,
	}: StudentId & {
		withoutMarks?: boolean
		withExpiredClassAssign?: boolean
	}) {
		return this.get<AssignmentForCurrentTerm[]>(
			ROUTES.assignmentsForCurrentTerm,
			{
				params: {
					studentId,
					withoutMarks: withoutMarks ?? true,
					withExpiredClassAssign: withExpiredClassAssign ?? false,
				},
			}
		)
	}

	async subjects({ studentId, schoolYearId }: StudentAndYear) {
		return this.get<Subject[]>(ROUTES.subjects, {
			params: { studentId, schoolYearId },
		})
	}

	async subjectPerformance({
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

	async totals({ studentId, schoolYearId }: StudentAndYear) {
		return this.get<Total[]>(ROUTES.totals, {
			params: {
				studentId,
				schoolYearId,
			},
		})
	}
}

export const API = new NetSchoolApi()
