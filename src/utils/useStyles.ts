import { Theme, ThemeStore } from '@/models/theme'
import React, { useMemo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

export function useStyles<T extends ViewStyle = ViewStyle>(
	callback: (theme: ThemeStore) => StyleProp<T>,
	deps?: React.DependencyList,
) {
	const styles = useMemo(
		() => {
			return callback(Theme)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		deps ? [callback, Theme.key, ...deps] : [callback, Theme.key],
	)

	return styles
}
