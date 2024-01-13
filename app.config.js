// eslint-disable-next-line no-undef
const IS_DEV = process.env.DEV === 'development'

export default {
	expo: {
		name: IS_DEV ? 'XDnevnik Dev Client' : 'XDnevnik',
		slug: 'xdnevnik',
		version: '0.12.0',
		owner: 'leaftail1880',
		orientation: 'portrait',
		icon: './assets/icon.png',
		userInterfaceStyle: 'automatic',
		splash: {
			image: './assets/splash.png',
			resizeMode: 'contain',
			backgroundColor: '#ffffff',
		},
		assetBundlePatterns: ['**/*'],
		ios: {
			supportsTablet: true,
			bundleIdentifier: IS_DEV
				? 'com.leaftail1880.xdnevnik.dev'
				: 'com.leaftail1880.xdnevnik',
		},
		android: {
			permissions: ['FOREGROUND_SERVICE', 'REQUEST_INSTALL_PACKAGES'],
			adaptiveIcon: {
				foregroundImage: './assets/adaptive-icon.png',
				backgroundColor: '#ffffff',
			},
			package: IS_DEV
				? 'com.leaftail1880.xdnevnik.dev'
				: 'com.leaftail1880.xdnevnik',
		},
		extra: {
			eas: {
				projectId: '97163afe-5c7e-4856-ba8f-348e00aa7c04',
			},
		},
		runtimeVersion: {
			policy: 'appVersion',
		},
		plugins: ['expo-dev-client', 'expo-updates'],
	},
}




