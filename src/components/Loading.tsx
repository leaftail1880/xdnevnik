import { StyleSheet, View } from 'react-native'
import { ActivityIndicator, Text } from 'react-native-paper'
import { Spacings } from '../utils/Spacings'

interface LoadingProps {
	text?: string
}

// eslint-disable-next-line mobx/missing-observer
export default function Loading({ text = 'Загрузка...' }: LoadingProps) {
	return (
		<View style={styles.view}>
			<ActivityIndicator />
			<Text>{text}</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	view: {
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center',
		alignContent: 'stretch',
		alignSelf: 'center',
		gap: Spacings.s2,
	},
})
