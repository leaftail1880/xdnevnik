/** @type {import("eslint").ESLint.ConfigData} */
// eslint-disable-next-line no-undef
module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		'plugin:react-hooks/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	plugins: ['react', 'react-hooks', '@typescript-eslint'],
	parser: '@typescript-eslint/parser',
	rules: {
		'no-empty': 'warn',
		'prefer-const': 'warn',
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/explicit-member-accessibility': 'warn',
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
				format: ['camelCase', 'PascalCase'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
			},
			{
				selector: 'variable',
				modifiers: ['exported', 'const'],
				format: ['UPPER_CASE'],
				leadingUnderscore: 'allow',
				trailingUnderscore: 'allow',
			},

			{
				selector: 'typeLike',
				format: ['PascalCase'],
			},
		],
	},
	root: true,
}
