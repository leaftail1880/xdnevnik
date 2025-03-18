// @ts-check
/** @type {Record<string, import('jest').Config['transform']>} */
const transformers = {
	default: {},
	['swc-tsx']: {
		'\\.tsx?$': '@swc/jest',
	},
	['swc-all']: {
		'^.+\\.(t|j)sx?$': 'swc-flow-jest',
	},
}

/** @type {import('jest').Config} */
module.exports = {
	preset: 'jest-expo',
	transform: transformers[process.env.TRANSFORMER ?? 'swc-all'],
	transformIgnorePatterns: [
		'/node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@material)',
		'/node_modules/react-native-reanimated/plugin/',
	],
	setupFiles: [
		'./src/utils/configure.ts',
		'./src/utils/polyfill.ts',
		'./jest.setup.ts',
	],
	globals: {
		__DEV__: true,
	},
	cacheDirectory: process.env.CI ? '.jest' : undefined,
}
