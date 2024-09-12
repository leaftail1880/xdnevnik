import { autorun, runInAction } from 'mobx'
import { Logger } from '../../constants'
import { RequestError } from '../../utils/RequestError'
import { Toast } from '../../utils/Toast'
import { API } from './api'
import { ROUTES } from './routes'

// TODO Move session storing logic here

let requestSent = false

autorun(function autologin() {
	// Not loaded
	if (!API.session) return

	// Already authorized
	if (API.authorized) return

	// Already sent auth req
	if (requestSent) return

	// Session is still active
	if (API.session.expires.getTime() > Date.now()) {
		if (!__DEV__)
			Logger.debug(
				'Session is still active, expires: ',
				API.session.expires.toReadable(),
				'now is',
				new Date().toReadable(),
			)

		runInAction(() => {
			API.authorized = true
		})
		return
	}

	requestSent = true
	API.getToken(
		ROUTES.refreshTokenTemplate(API.session.refresh_token),
		'Ошибка при авторизации, перезайдите.',
	)
		.catch(e => {
			Toast.show({ title: RequestError.stringify(e), error: true })
		})
		.finally(() => {
			requestSent = false
		})
})
