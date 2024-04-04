import react from '@vitejs/plugin-react-swc'
import fs from 'fs'
import path from 'path'
import { UserConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import {} from 'vite-react-ssg'

const base = '/xdnevnik/'

// https://vitejs.dev/config/
export default {
	plugins: [
		react(),
		createHtmlPlugin({
			minify: true,
		}),
	],
	base,
	ssgOptions: {
		onFinished() {
			const source = path.join('dist', base)

			fs.cpSync(source, 'dist/', {
				force: true,
				recursive: true,
			})
			fs.rmSync(source, { force: true, recursive: true })
		},
	},
} satisfies UserConfig
