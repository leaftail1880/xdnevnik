import { AsyncStore } from '../Stores/Async'

/* eslint-disable @typescript-eslint/naming-convention */
export interface GithubRelease {
	url: string
	html_url: string
	assets_url: string
	upload_url: string
	tarball_url: string
	zipball_url: string
	id: number
	node_id: string
	tag_name: string
	target_commitish: string
	name: string
	body: string
	prerelease: boolean
	assets: {
		browser_download_url: string
		id: number
		name: string
		label: string
		state: string
		content_type: string
		size: number
		download_count: number
	}[]
}

class GithubApi {
	static Error = class GithubApiError extends Error {}

	async fetch(url: string) {
		const response = await fetch(url)

		if (!response.ok) {
			if (Number(response.headers.get('x-ratelimit-remaining')) === 0) {
				const max = Number(response.headers.get('x-ratelimit-limit'))
				const resetOn = Number(response.headers.get('x-ratelimit-reset'))
				throw new GithubApi.Error(
					`Достигнут лимит запросов: 0/${max}. Попробуйте снова после ${new Date(
						resetOn
					).toReadable()}`
				)
			} else {
				throw new GithubApi.Error(
					`Ошибка ${response.status}: ${response.statusText}`
				)
			}
		}

		return response.json()
	}

	async getReleases() {
		return (await this.fetch(
			'https://api.github.com/repos/leaftail1880/xdnevnik/releases'
		)) as GithubRelease[]
	}
}

const API = new GithubApi()

export const Github = {
	Releases: new AsyncStore(API, 'getReleases', 'списка версий', {}, () => []),
}