import * as Sentry from '@sentry/react-native'
import * as updates from 'expo-updates'

// Construct a new instrumentation instance. This is needed to communicate between the integration and React
export const SENTRY_ROUTING =
	new Sentry.ReactNavigationInstrumentation()

const manifest = updates.manifest
const metadata =
	manifest && 'metadata' in manifest ? manifest.metadata : undefined
const extra = manifest && 'metadata' in manifest ? manifest.extra : undefined
const updateGroup =
	metadata && 'updateGroup' in metadata ? metadata.updateGroup : undefined

Sentry.configureScope(scope => {
	scope.setTag('expo-update-id', updates.updateId)
	scope.setTag('expo-is-embedded-update', updates.isEmbeddedLaunch)

	if (typeof updateGroup === 'string') {
		scope.setTag('expo-update-group-id', updateGroup)

		const owner = extra?.expoClient?.owner ?? '[account]'
		const slug = extra?.expoClient?.slug ?? '[project]'
		scope.setTag(
			'expo-update-debug-url',
			`https://expo.dev/accounts/${owner}/projects/${slug}/updates/${updateGroup}`
		)
	} else if (updates.isEmbeddedLaunch) {
		// This will be `true` if the update is the one embedded in the build, and not one downloaded from the updates server.
		scope.setTag('expo-update-debug-url', 'not applicable for embedded updates')
	}
})

Sentry.init({
	dsn: 'https://9f602cf540f26a8de9d5d708df4558b3@o4506601427369984.ingest.sentry.io/4506601430122496',
	// Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
	tracesSampleRate: 0.9,
	ignoreErrors: [/Unable activate keep awake/g],
	integrations: [
		new Sentry.ReactNativeTracing({
			routingInstrumentation: SENTRY_ROUTING,
		}),
	],

	enabled: !__DEV__,
})
