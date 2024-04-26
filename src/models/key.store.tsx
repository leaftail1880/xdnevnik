import { action, makeAutoObservable, runInAction } from 'mobx'
import { useEffect } from 'react'

interface KeyStoreOptions {
	maxUnusedStores: number
}

interface StoredValue<T> {
	id: string
	store: T
	canDispose: boolean
	dispose: () => () => void
}

export class KeyStore<Key = object, T = object> {
	private stores: Record<string, StoredValue<T>> = {}
	private readonly options: KeyStoreOptions

	constructor(
		private readonly getId: (id: Key) => string,
		private readonly createStore: (id: Key) => T,
		{ maxUnusedStores = 3 }: Partial<KeyStoreOptions> = {}
	) {
		makeAutoObservable<this, 'options' | 'create' | 'stores'>(this, {
			create: action,
			stores: true,
			options: false,
			use: false,
			get: false,
		})
		this.options = { maxUnusedStores }
	}

	get(
		key: Key,
		setCanDispose = true
	): Omit<StoredValue<T>, 'canDispose' | 'sid'> {
		const id = this.getId(key)
		if (this.stores[id]) {
			if (setCanDispose)
				runInAction(() => {
					this.stores[id].canDispose = false
				})

			return this.stores[id]
		}

		return this.create(key, id)
	}

	use(id: Key) {
		const { store, dispose } = this.get(id)

		// eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps
		useEffect(dispose, [])
		return store
	}

	private create(id: Key, sid: string) {
		const store = this.createStore(id)

		const unusedStores = Object.values(this.stores).filter(e => e.canDispose)
		if (unusedStores.length > this.options.maxUnusedStores) {
			runInAction(() => {
				delete this.stores[unusedStores[0].id]
			})
		}

		return (this.stores[sid] = {
			id: sid,
			store,
			canDispose: false,
			dispose: () => () => {
				runInAction(() => {
					this.stores[sid].canDispose = true
				})
			},
		})
	}
}
