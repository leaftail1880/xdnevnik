import './client'
import React from 'react'
import type { RouteRecord } from 'vite-react-ssg'

const Layout = React.lazy(() => import('./layout/layout'))

export const routes: RouteRecord[] = [
	{
		path: import.meta.env.BASE_URL,
		element: <Layout />,
		entry: 'src/layout/index.tsx',
		children: [
			{
				index: true,
				Component: React.lazy(() => import('./layout/landing')),
				entry: 'src/layout/landing.tsx',
			},
			{
				path: '*',
				Component: React.lazy(() => import(`./sections/404`)),
			},
			...['hero', 'features', 'about', 'faq', '404'].map(e => ({
				path: e,
				Component: React.lazy(() => import(`./sections/${e}.tsx`)),
				entry: `src/sections/${e}.tsx`,
			})),
		],
	},
]
