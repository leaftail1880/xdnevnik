// @ts-check
/** @type {import('jest').Config} */
const jestExpo = require('jest-expo/jest-preset.js')

/** @type {import('jest').Config} */
module.exports = {
	preset: 'jest-expo',
	transform: {
		'\\.tsx?$': '@swc/jest',
		...jestExpo.transform,
	},
	transformIgnorePatterns: [
		'/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@material)',
		'/node_modules/react-native-reanimated/plugin/',
	],
	setupFiles: [
		...(jestExpo.setupFiles ?? []),
		'./src/utils/configure.ts',
		'./src/utils/polyfill.ts',
		'./jest.setup.ts',
	],
	globals: {
		__DEV__: true,
	},
}
