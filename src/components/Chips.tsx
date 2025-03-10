import React from "react";
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Spacings } from "~utils/Spacings";

const styles = StyleSheet.create({
  style: { padding: Spacings.s2 },
  contentContainerStyle: { gap: Spacings.s2 }
})

// eslint-disable-next-line mobx/missing-observer
export function Chips(props: {children: React.ReactNode, style?: StyleProp<ViewStyle>}) {
  return <ScrollView
    style={[styles.style, props.style]}
			contentContainerStyle={styles.contentContainerStyle}
			showsHorizontalScrollIndicator={false}
      fadingEdgeLength={100}
			horizontal
		>
      {props.children}
    </ScrollView>
}