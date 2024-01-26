import * as Application from 'expo-application'
import { Alert } from 'react-native'

/* eslint-disable @typescript-eslint/naming-convention */
interface GithubRelease {
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

export async function getLatestGithubReleaseUrl(
	filename: string,
	{
		ifAlreadyLatest = () => Alert.alert('Уже последняя'),
		ifNoRelease = () => Alert.alert('Не удалось найти релиз'),
		ifNoAsset = () =>
			Alert.alert('Обновление еще собирается, попробуйте через пару минут!'),
		ifRatelimit = (max: number, resetOn: number) =>
			Alert.alert(
				`Достигнут лимит запросов: 0/${max}`,
				`Попробуйте снова после ${new Date(resetOn).toReadable()}`
			),
	}
) {
	const response = await fetch(
		'https://api.github.com/repos/leaftail1880/xdnevnik/releases'
	)

	if (!response.ok) {
		if (Number(response.headers.get('x-ratelimit-remaining')) === 0) {
			return ifRatelimit(
				Number(response.headers.get('x-ratelimit-limit')),
				Number(response.headers.get('x-ratelimit-reset'))
			)
		} else
			Error(`Ошибка при запросе: ${response.status} ${response.statusText}`)
	}

	const releases: GithubRelease[] = await response.json()
	const release = releases[0]
	if (!release) return ifNoRelease()

	if (release.tag_name === Application.nativeApplicationVersion)
		return ifAlreadyLatest()

	const asset = release.assets.find(e => e.name === filename)
	if (!asset) return ifNoAsset()

	return asset?.browser_download_url
}
