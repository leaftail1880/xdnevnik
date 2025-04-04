export interface RequestErrorOptions {
	loggerIgnore?: boolean
}

export enum RequestErrorReason {
	noConnection = 'Нет сети',
	timeout = 'Сервер не отвечает. Медленный интернет, конец четверти или техработы',
}

export class RequestError extends Error implements RequestErrorOptions {
	static stringify(e: object): string | RequestErrorReason {
		let result: string

		if (e instanceof Error) {
			if (e.name === 'AbortError') {
				result = RequestErrorReason.timeout
			}
		}

		if (e instanceof TypeError) {
			if (e.message.includes('Network request failed')) {
				result = RequestErrorReason.noConnection
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

export function abortSignalTimeout(ms: number) {
	const controller = new AbortController()

	setTimeout(() => {
		if (!controller.signal.aborted) controller.abort()
	}, ms)

	return controller.signal
}
