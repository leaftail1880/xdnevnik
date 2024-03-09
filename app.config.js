// @ts-check
import withBuildProperties from 'expo-build-properties'
import { withGradleProperties } from 'expo/config-plugins'

// eslint-disable-next-line no-undef
const IS_DEV = !!process.env.DEV

const bundle = IS_DEV
	? 'com.leaftail1880.xdnevnik.dev'
	: 'com.leaftail1880.xdnevnik'

/** @type {[string, any]} */
const sentryPlugin = [
	'@sentry/react-native/expo',
	{
		organization: 'leaftail1880',
		project: 'xdnevnik',
	},
]

/** @type {{expo: import("@expo/config-types/build/ExpoConfig.js").ExpoConfig}} */
const Config = {
	expo: {
		name: IS_DEV ? 'XDnevnik Dev Client' : 'XDnevnik',
		slug: 'xdnevnik',
		version: '0.14.1',
		owner: 'leaftail1880',
		orientation: 'portrait',
		icon: './assets/icon.png',
		userInterfaceStyle: 'automatic',
		splash: {
			image: './assets/splash.png',
			resizeMode: 'contain',
			backgroundColor: '#FFFFFF',
			dark: {
				image: './assets/splash.png',
				resizeMode: 'contain',
				backgroundColor: '#000000',
			},
		},
		notification: { icon: './assets/notification_icon.png', color: '#ffffff' },
		assetBundlePatterns: ['**/*'],
		ios: {
			supportsTablet: true,
			bundleIdentifier: bundle,

			infoPlist: {
				UIBackgroundModes: ['lesson-notifications'],
			},
		},
		android: {
			permissions: ['FOREGROUND_SERVICE', 'REQUEST_INSTALL_PACKAGES'],
			adaptiveIcon: {
				foregroundImage: './assets/adaptive-icon.png',
				backgroundColor: '#FFFFFF',
			},

			package: bundle,
		},

		runtimeVersion: {
			policy: 'appVersion',
		},
		plugins: [
			IS_DEV ? 'expo-dev-client' : '',
			sentryPlugin,
			'expo-updates',
			'expo-build-properties',
		].filter(Boolean),

		updates: {
			url: 'https://u.expo.dev/97163afe-5c7e-4856-ba8f-348e00aa7c04',
		},
		extra: {
			eas: {
				projectId: '97163afe-5c7e-4856-ba8f-348e00aa7c04',
			},
		},
	},
}

Config.expo = withBuildProperties(Config.expo, {
	android: {
		enableProguardInReleaseBuilds: true,
		enableShrinkResourcesInReleaseBuilds: true,
		useLegacyPackaging: true,
	},
})

// Archs armeabi-v7a arm64-v8a x86 x86_64

Config.expo = withGradleProperties(Config.expo, config => {
	config.modResults.push({
		type: 'property',
		key: 'org.gradle.jvmargs',
		value: '-Xmx3096m -XX:MaxMetaspaceSize=512m',
	})

	return config
})

export default Config
