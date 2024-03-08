import { autorun, runInAction } from 'mobx'
import Toast from 'react-native-toast-message'
import { Logger } from '../Setup/constants'
import { RequestError } from '../utils/RequestError'
import { API } from './api'
import { ROUTES } from './routes'

let requestSent = false

setTimeout(() => {
	autorun(function autologin() {
		// Not loaded
		if (!API.session) return

		// Already authorized
		if (API.authorized) return

		// Already sent auth req
		if (requestSent) return

		// Session is still active
		if (API.session.expires.getTime() > Date.now()) {
			Logger.debug(
				'Session is still active, expires: ',
				API.session.expires.toReadable(),
				'now is',
				new Date().toReadable()
			)
			runInAction(() => {
				API.authorized = true
			})
			return
		}

		requestSent = true
		API.getToken(
			ROUTES.refreshTokenTemplate(API.session.refresh_token),
			'Ошибка при авторизации, перезайдите.'
		)
			.then(() => {
				Toast.show({ text1: 'Вы авторизовались' })
			})
			.catch(e => {
				Toast.show({ text1: RequestError.stringify(e), type: 'error' })
			})
			.finally(() => {
				requestSent = false
			})
	})
}, 2000)
