import { autorun, runInAction } from 'mobx'
import { API, NetSchoolApi } from '../../NetSchool/api'
import { ROUTES } from '../../NetSchool/routes'
import { XDnevnik } from '../../Stores/Xdnevnik.store'

let requestSent = false

autorun(function autologin() {
	// Not loaded
	if (!API.session) return

	// Already authorized
	if (API.authorized) return

	// Already sent auth req
	if (requestSent) return

	// Session is still active
	if (API.session.expires.getTime() < Date.now()) {
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
			if (XDnevnik.status) {
				XDnevnik.showToast({ content: 'Вы авторизовались' })
			}
		})
		.catch(e => {
			runInAction(() => {
				XDnevnik.showToast({
					content: NetSchoolApi.stringifyError(e),
					error: true,
				})
			})
		})
		.finally(() => {
			requestSent = false
		})
})
