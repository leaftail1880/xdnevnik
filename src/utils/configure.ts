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
