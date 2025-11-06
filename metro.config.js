// @ts-check
/* eslint-disable */
const { getSentryExpoConfig } = require('@sentry/react-native/metro')

const config = getSentryExpoConfig(__dirname)

if (config.resolver) {
	// @ts-expect-error yes this is expo yes yes i love them so much timeless debugging is my only way to spend time
	config.resolver.unstable_enablePackageExports = false
} else {
	throw new Error('NO RESOLVER IN CONFIG')
}

module.exports = {
	...config,
}
