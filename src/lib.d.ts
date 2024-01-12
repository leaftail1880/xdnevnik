declare global {
	export type JSONLike = Record<
		string,
		string | object | number | symbol | boolean | undefined
	>
}

export {}

export type ReadonlyDate = Readonly<
	OmitStrict<
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