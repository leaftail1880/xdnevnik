export const ROUTES = {
	mobileAppProtocol: 'irtech://', // custom
	getServersList: 'https://identity.ir-tech.ru/users/endpoints',
	getTextResources:
		'https://mobile.ir-tech.ru/api/v1/mobile/parent/text-resources',
	getEndpointNotifications:
		'https://mobile.ir-tech.ru/api/v1/mobile/parent/endpoint-notifications?',
	getLocationsList: 'https://mobile.ir-tech.ru/api/v1/mobile/parent/locations',
	getEndPointsList: 'https://mobile.ir-tech.ru/api/v1/mobile/parent/end-points', // used
	getFeedbackOptions:
		'https://mobile.ir-tech.ru/api/v1/mobile/parent/feedback-options',
	getExactTime: 'https://mobile.ir-tech.ru/api/v1/mobile/parent/time',
	getPublishedVersion:
		'https://mobile.ir-tech.ru/api/v1/mobile/parent/app-versions/published',
	students: '/students', // used
	subjectPerformance: '/analytics/subject-performance?', // used
	login: '/login?mobile', // used
	users: '/users',
	version: '/version',
	education: '/education?', //used
	subjects: '/subjects?', // used
	portfolios: '/portfolios',
	totals: '/totals?', // used
	addressBook: '/address-book?',
	recipientByUserId: '/address-book/recipients/get-by-userid?',
	addressBookOrganizations: '/address-book/organizations?',
	terms: '/terms?',
	announcements: '/announcements?',
	attachments: '/attachments?',
	getAttachment: '/attachments/',
	classmeetings: '/classmeetings', // used
	assignments: '/assignments', // used
	assignmentsForCurrentTerm: '/assignments/for-current-term?', // used
	answer: '/assignments/',
	distance: '/distancemeetings/',
	distanceGetBatch: '/distancemeetings/get-batch',
	answerEnd: '/answer?',
	answerEndSaveText: '/answer/text?',
	answerEndFiles: '/answer/files?',
	getToken: 'https://identity.ir-tech.ru/connect/token',
	// eslint-disable-next-line @typescript-eslint/naming-convention
	getTokenTemplate(device_code: string) {
		return {
			grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
			device_code,
			client_id: 'parent-mobile',
			client_secret: '04064338-13df-4747-8dea-69849f9ecdf0',
		}
	}, // modified from object
	// eslint-disable-next-line @typescript-eslint/naming-convention
	refreshTokenTemplate(refresh_token: string) {
		return {
			grant_type: 'refresh_token',
			client_id: 'parent-mobile',
			client_secret: '04064338-13df-4747-8dea-69849f9ecdf0',
			refresh_token,
		}
	}, // modified from object
}
