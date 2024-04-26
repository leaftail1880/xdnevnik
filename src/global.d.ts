declare global {
	export type JSONLike = Record<
		string,
		string | object | number | boolean | undefined
	>

	/**
	 * A way to select only accepted type from object
	 */
	export type FilterObject<O extends object, V> = {
		[Key in keyof O as O[Key] extends V ? Key : never]: O[Key]
	}

	type ReadonlyDate = Readonly<
		Omit<
			Date,
			| 'setTime'
			| 'setMilliseconds'
			| 'setUTCMilliseconds'
			| 'setSeconds'
			| 'setUTCSeconds'
			| 'setMinutes'
			| 'setUTCMinutes'
			| 'setHours'
			| 'setUTCHours'
			| 'setDate'
			| 'setUTCDate'
			| 'setMonth'
			| 'setUTCMonth'
			| 'setFullYear'
			| 'setUTCFullYear'
		>
	>
}

export {}
