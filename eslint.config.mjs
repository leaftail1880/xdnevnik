// @ts-check
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import mobx from 'eslint-plugin-mobx'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import path from 'path'
import tseslint from 'typescript-eslint'
import { fileURLToPath } from 'url'

// CommonJS variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname })

export default tseslint.config(
	{
		ignores: [
			'docs',
			'swc-flow-jest',
			'jest.*.js',
			'jest.*.ts',
			'*.test.*',
			'eslint.config.mjs',
		],
	},
	eslint.configs.recommended,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	...compat.extends('plugin:react-native/all'),
	reactHooks.configs['recommended-latest'],
	tseslint.configs.recommended,
	mobx.flatConfigs.recommended,
	prettier,
	{
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

			'mobx/missing-make-observable': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/explicit-member-accessibility': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
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
	},
)
