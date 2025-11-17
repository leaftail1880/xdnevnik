import { configure as configureMobx } from 'mobx'
import { configurePersistable } from 'mobx-persist-store'
import { createMMKV } from 'react-native-mmkv'

configureMobx({
	enforceActions: 'always',
	computedRequiresReaction: true,
})

const storage = createMMKV()
configurePersistable({
	removeOnExpiration: false,
	storage: {
		setItem: (key, data) => storage.set(key, data),
		getItem: key => storage.getString(key)!,
		removeItem: key => void storage.remove(key),
	},
})

if (!__TEST__) setTimeout(() => storage.trim(), 20000) // Cleanup

export function getTotalStorageSize() {
	return storage.size
}
export function getStorageKeySize(key: string) {
	return storage.getBuffer(key)?.byteLength ?? 0
}

export function getStorageValue(key: string) {
	return storage.getString(key)!
}
export function setStorageValue(key: string, value: string) {
	storage.set(key, value)
}
