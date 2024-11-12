import * as FileSystem from 'expo-file-system'
import { makeAutoObservable } from 'mobx'
import { makeReloadPersistable } from '../../../utils/makePersistable'

class UpdateState {
	progress: null | { i: number; bar?: number; version: string } = null
	files: { uri: string; version: string }[] = []
	downloader?: FileSystem.DownloadResumable
	paused = false
	currentI = 0

	setProgress(progress: (typeof this)['progress']) {
		this.progress = progress
	}

	constructor() {
		makeAutoObservable(
			this,
			{ downloader: false, currentI: false },
			{ autoBind: true },
		)
		makeReloadPersistable(this, { name: 'updates', properties: ['files'] })
	}
}

export default new UpdateState()
