declare global {
	export type JSONLike = Record<
		string,
		string | object | number | symbol | boolean | undefined
	>
}

export {}

