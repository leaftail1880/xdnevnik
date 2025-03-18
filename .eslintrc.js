/** @type {import("eslint").ESLint.ConfigData} */
// eslint-disable-next-line no-undef
module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-native/all',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:mobx/recommended',
		'prettier',
	],
	plugins: [
		'react',
		'react-hooks',
		'react-native',
		'@typescript-eslint',
		'mobx',
		'import',
	],
	parser: '@typescript-eslint/parser',
	settings: {
		react: { version: 'detect' },
	},
	rules: {
		'no-empty': 'warn',
		'no-console': 'warn',
		'prefer-const': 'warn',
		'react-native/no-raw-text': [
			'error',
			{
				skip: [
					'Chip',
					'DataTable.Title',
					'HelperText',
					'Button',
					'Dialog.Title',
				],
			},
		],

		'react-native/sort-styles': 'off',
		'react-native/no-inline-styles': 'off',
		'react/prop-types': 'off',

		// Disabling allowSyntheticalDefaultExport in tsconfig will cause
		// untyped components
		// but when its enabled its easy to shoot yourself in the feet by using
		// import x from 'expo-updates'
		// bc x will be undefined in the runtime. So we need another way to
		// warn developer using eslint plugin.
		'import/default': 'error',
		'mobx/missing-make-observable': 'off',
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/explicit-member-accessibility': 'off',
		'@typescript-eslint/naming-convention': [
			'warn',
			{
				selector: 'default',
				format: ['camelCase'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
			},

			{
				selector: ['objectLiteralMethod', 'objectLiteralProperty'],
				format: null,
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
			},

			{
				selector: 'function',
				format: ['camelCase', 'PascalCase'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
			},

			{
				selector: 'variable',
				format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
			},
			{
				selector: 'variable',
				modifiers: ['exported', 'const'],
				format: ['UPPER_CASE', 'PascalCase'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
			},

			{
				selector: 'typeLike',
				format: ['PascalCase'],
			},

			{
				selector: 'import',
				format: null,
			},
		],
	},
	overrides: [
		{
			// Test files only
			files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
			extends: ['plugin:testing-library/react'],
		},
	],
	root: true,
	ignorePatterns: ['docs/*', 'jest.*.js', 'jest.*.ts', 'swc-flow-jest'],
}
