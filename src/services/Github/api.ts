import { observable } from 'mobx'
import { AsyncStore } from '../../models/async.store'
import { makeReloadPersistable } from '../../utils/makePersistable'
import { GithubRelease } from './entities'

class CacheStore {
	@observable cache: Record<string, JSONLike> = {}

	constructor(public readonly name: string) {
		makeReloadPersistable(this, {
			name,
			properties: ['cache'],
		})
	}
}

class GithubApi {
	static error = class GithubApiError extends Error {}

	private cache = new CacheStore('github').cache
	private attempt = 0

	private async fetch<T>(url: string): Promise<T> {
		if (this.attempt === 0) {
			if (this.cache[url]) return this.cache[url] as T
		}

		this.attempt++

		const response = await fetch(url)

		if (!response.ok) {
			if (Number(response.headers.get('x-ratelimit-remaining')) === 0) {
				const max = Number(response.headers.get('x-ratelimit-limit'))
				const resetOn = Number(response.headers.get('x-ratelimit-reset'))

				throw new GithubApi.error(
					`Достигнут лимит запросов: 0/${max}. Попробуйте снова после ${new Date(
						resetOn,
					).toReadable()}`,
				)
			} else {
				throw new GithubApi.error(
					`Ошибка ${response.status}: ${response.statusText}`,
				)
			}
		}

		return response.json()
	}

	async getReleases() {
		return await this.fetch<GithubRelease[]>(
			'https://api.github.com/repos/leaftail1880/xdnevnik/releases',
		)
	}
}

const API = new GithubApi()

export const Github = {
	Releases: new AsyncStore(API, 'getReleases', 'списка версий', {}, () => []),
}
