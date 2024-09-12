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
