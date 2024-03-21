// @ts-check
import withBuildProperties from 'expo-build-properties'
import {
	AndroidConfig,
	withAndroidColorsNight,
	withGradleProperties,
} from 'expo/config-plugins'

// eslint-disable-next-line no-undef
const IS_DEV = !!process.env.DEV

const id = IS_DEV
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

const splashBackgroundDark = '#252525'
const splashBackgroundLight = '#EBEAEA'

/** @type {import("@expo/config-types/build/ExpoConfig.js").ExpoConfig['splash']} */
const splash = {
	image: './assets/splash.png',
	resizeMode: 'cover',
	backgroundColor: splashBackgroundLight,
	dark: {
		image: './assets/splash.png',
		resizeMode: 'cover',
		backgroundColor: splashBackgroundDark,
	},
}

const projectId = '97163afe-5c7e-4856-ba8f-348e00aa7c04'

/** @type {{expo: import("@expo/config-types/build/ExpoConfig.js").ExpoConfig}} */
const Config = {
	expo: {
		name: IS_DEV ? 'XDnevnik Dev Client' : 'XDnevnik',
		slug: 'xdnevnik',
		version: '0.14.6',
		owner: 'leaftail1880',
		orientation: 'portrait',
		icon: './assets/icon.png',
		notification: {
			icon: './assets/notification_icon.png',
			color: splashBackgroundLight,
		},
		assetBundlePatterns: ['**/*'],
		userInterfaceStyle: 'automatic',

		ios: {
			bundleIdentifier: id,
			splash: splash,
			userInterfaceStyle: 'automatic',
			infoPlist: {
				UIBackgroundModes: ['lesson-notifications'],
			},
		},

		android: {
			package: id,
			splash: splash,
			userInterfaceStyle: 'automatic',
			permissions: ['FOREGROUND_SERVICE', 'REQUEST_INSTALL_PACKAGES'],
			adaptiveIcon: {
				foregroundImage: './assets/adaptive-icon.png',
				backgroundColor: splashBackgroundLight,
			},
			versionCode: 10,
		},
		androidNavigationBar: {
			visible: 'immersive',
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
			url: `https://u.expo.dev/${projectId}`,
		},
		extra: {
			eas: {
				projectId: projectId,
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

Config.expo = withGradleProperties(Config.expo, config => {
	config.modResults.push(
		{
			type: 'property',
			key: 'reactNativeArchitectures',
			value: 'armeabi-v7a,arm64-v8a', //,x86,x86_64
		},
		{
			type: 'property',
			key: 'org.gradle.jvmargs',
			value: '-Xmx3096m -XX:MaxMetaspaceSize=512m',
		},
		{
			type: 'property',
			key: 'gradle',
			value: 'build -x lint -x lintVitalRelease',
		}
	)

	return config
})

// Adjust color of the android status bar during splash screen
const { assignColorValue } = AndroidConfig.Colors
Config.expo = withAndroidColorsNight(Config.expo, async config => {
	config.modResults = assignColorValue(config.modResults, {
		name: 'colorPrimaryDark',
		value: splashBackgroundDark,
	})
	return config
})

export default Config
