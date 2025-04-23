import { runInAction } from 'mobx'

export function setInAction<T extends object>(
	store: T,
	assignment: Partial<T>,
) {
	runInAction(() => {
		for (const [key, value] of Object.entries(assignment)) {
			// @ts-expect-error uhhh idk
			store[key] = value
		}
	})
}
