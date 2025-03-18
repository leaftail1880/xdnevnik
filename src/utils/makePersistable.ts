import { PersistStoreMap, makePersistable } from 'mobx-persist-store'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const makeReloadPersistable: typeof makePersistable = (
	object,
	options,
) => {
	// Prevent warnings while dev
	/* istanbul ignore if */
	if (__DEV__) {
		for (const [key, store] of PersistStoreMap.entries()) {
			if (store.storageName === options.name) {
				store.stopPersisting()
				PersistStoreMap.delete(key)
			}
		}
	}

	return makePersistable(object, options, {
		delay: 200,
		fireImmediately: false,
	})
}
