import { Spacings } from '@/utils/Spacings'
import React from 'react'
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from 'react-native'

const styles = StyleSheet.create({
	style: { padding: Spacings.s2 },
	contentContainerStyle: { gap: Spacings.s2 },
})

// eslint-disable-next-line mobx/missing-observer
export function Chips(props: {
	children: React.ReactNode
	style?: StyleProp<ViewStyle>
}) {
	if (
		Array.isArray(props.children) &&
		props.children.filter(Boolean).length === 0
	)
		return

	return (
		<ScrollView
			style={[styles.style, props.style]}
			contentContainerStyle={styles.contentContainerStyle}
			showsHorizontalScrollIndicator={false}
			fadingEdgeLength={100}
			horizontal
		>
			{props.children}
		</ScrollView>
	)
}
