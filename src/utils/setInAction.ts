import { Logger } from '@/constants'
import { isObservable, runInAction } from 'mobx'

export function setInAction<T extends object>(
	store: T,
	assignment: Partial<T>,
) {
	if (!isObservable(store)) Logger.warn(new Error('Non-observable object!'))

	runInAction(() => {
		for (const [key, value] of Object.entries(assignment)) {
			// @ts-expect-error uhhh idk
			store[key] = value
		}
	})
}
