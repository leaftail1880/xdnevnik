import { View } from 'react-native'
import { ActivityIndicator, Text } from 'react-native-paper'
import { Spacings } from './Spacings'

interface LoadingProps {
	/**
	 * {dots} can be used to set loading dots
	 */
	text?: string
}

// eslint-disable-next-line mobx/missing-observer
export function Loading({ text = 'Загрузка' }: LoadingProps) {
	if (!text.includes('{dots}')) text += '...'

	return (
		<View
			style={{
				padding: 10,
				flexDirection: 'row',
				alignItems: 'center',
				alignContent: 'stretch',
				alignSelf: 'center',
			}}
		>
			<ActivityIndicator />
			<Text style={{ margin: Spacings.s2 }}>
				{text.replace(/\{dots\}/g, '...')}
			</Text>
		</View>
	)
}
