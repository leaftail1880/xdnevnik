import { makeObservable } from 'mobx'
import { useEffect } from 'react'

interface KeyStoreOptions {
	maxUnusedStores: number
}

interface StoredValue<T> {
	sid: string
	store: T
	canDispose: boolean
	dispose: () => () => void
}

export class KeyStore<ID = object, T = object> {
	private stores: Record<string, StoredValue<T>> = {}
	private readonly options: KeyStoreOptions

	constructor(
		private readonly stringifyId: (id: ID) => string,
		private readonly createStore: (id: ID) => T,
		{ maxUnusedStores = 3 }: Partial<KeyStoreOptions> = {}
	) {
		makeObservable<this, 'stores' | 'options' | 'create'>(this, {
			create: true,
			stores: true,
			options: false,
			get: false,
			use: false,
		})
		this.options = { maxUnusedStores }
	}

	get(id: ID): Omit<StoredValue<T>, 'canDispose' | 'sid'> {
		const sid = this.stringifyId(id)
		if (this.stores[sid]) {
			this.stores[sid].canDispose = false
			return this.stores[sid]
		}

		return this.create(id, sid)
	}

	use(id: ID) {
		const { store, dispose } = this.get(id)

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(dispose)
		return store
	}

	private create(id: ID, sid: string) {
		const store = this.createStore(id)

		const unusedStores = Object.values(this.stores).filter(e => e.canDispose)
		if (unusedStores.length > this.options.maxUnusedStores) {
			delete this.stores[unusedStores[0].sid]
		}

		return (this.stores[sid] = {
			sid,
			store,
			canDispose: false,
			dispose: () => () => {
				this.stores[sid].canDispose = true
			},
		})
	}
}
