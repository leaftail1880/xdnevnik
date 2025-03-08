// @ts-check
import withBuildProperties from 'expo-build-properties'
import {
	AndroidConfig,
	withAndroidManifest,
	withAndroidStyles,
	withGradleProperties,
} from 'expo/config-plugins'

const version = '0.18.0'

// eslint-disable-next-line no-undef
const IS_DEV = !!process.env.DEV

const id = IS_DEV
	? 'com.leaftail1880.xdnevnik.dev'
	: 'com.leaftail1880.xdnevnik'

const sentry = {
	organization: 'leaftail1880',
	project: 'xdnevnik',
}

const splashBackgroundDark = '#252525'
const splashBackgroundLight = '#EBEAEA'

const projectId = '97163afe-5c7e-4856-ba8f-348e00aa7c04'

/** @type {{expo: import("@expo/config-types/build/ExpoConfig.js").ExpoConfig}} */
const Config = {
	expo: {
		name: IS_DEV ? 'XDnevnik Dev Client' : 'XDnevnik',
		slug: 'xdnevnik',
		version: version,
		owner: 'leaftail1880',
		orientation: 'default',
		icon: './assets/icon.png',
		assetBundlePatterns: ['**/*'],
		userInterfaceStyle: 'automatic',
		notification: {
			icon: './assets/notification_icon.png',
			color: splashBackgroundLight,
		},

		ios: {
			bundleIdentifier: id,
			userInterfaceStyle: 'automatic',
			infoPlist: {
				UIBackgroundModes: ['lesson-notifications'],
			},
		},

		android: {
			package: id,
			userInterfaceStyle: 'automatic',
			permissions: [
				'FOREGROUND_SERVICE',
				'REQUEST_INSTALL_PACKAGES',
				'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
			],
			adaptiveIcon: {
				foregroundImage: './assets/adaptive-icon.png',
				backgroundColor: splashBackgroundLight,
			},
		},

		plugins: [
			'expo-dev-client',
			// IS_DEV ? 'expo-dev-client' : '',
			'expo-updates',
			'expo-build-properties',
			['@sentry/react-native/expo', sentry],
			[
				'expo-navigation-bar',
				{
					position: 'relative',
					visibility: 'visible',
					behavior: 'inset-swipe',
				},
			],
			[
				'expo-splash-screen',
				{
					backgroundColor: splashBackgroundLight,
					image: './assets/splash.png',
					dark: {
						image: './assets/splash.png',
						backgroundColor: splashBackgroundDark,
					},
					imageWidth: 1284,
				},
			],
		],

		runtimeVersion: {
			policy: 'appVersion',
		},
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

Config.expo.plugins = Config.expo.plugins?.filter(Boolean)

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
		},
	)

	return config
})

// Make dark theme properly work on Xiaomi devices
Config.expo = withAndroidStyles(Config.expo, config => {
	config.modResults = AndroidConfig.Styles.assignStylesValue(
		config.modResults,
		{
			add: true,
			parent: AndroidConfig.Styles.getAppThemeGroup(),
			name: `android:forceDarkAllowed`,
			value: 'false',
		},
	)
	return config
})

Config.expo = withAndroidManifest(Config.expo, config => {
	const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
		config.modResults,
	)
	if (mainApplication && !mainApplication?.service) {
		mainApplication.service = []
	}
	mainApplication?.service?.push({
		$: {
			'android:name': 'app.notifee.core.ForegroundService',
			'android:foregroundServiceType': 'dataSync',
		},
	})
	return config
})


export default Config
