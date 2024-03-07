export class RequestError extends Error implements RequestErrorOptions {
	static reasons = {
		noConnection: 'Нет сети.',
		timeout:
			'Долго нет ответа от сервера. Плохой интернет или сервер на техработах.',
	} as const
	static stringify(
		e: object
	): string | (typeof this.reasons)[keyof typeof this.reasons] {
		let result: string

		if (e instanceof Error) {
			if (e instanceof TypeError) {
				if (e.message.includes('Network request failed')) {
					result = this.reasons.noConnection
				}
			}

			if (e.name === 'AbortError') {
				result = this.reasons.timeout
			}
		}

		result ??= e + ''
		result = result.replace(/^Error: /, '')

		return result
	}

	loggerIgnore: boolean

	constructor(message: string, options?: RequestErrorOptions) {
		super(message)
		Object.assign(this, options ?? {})
	}
}

export interface RequestErrorOptions {
	loggerIgnore?: boolean
}
