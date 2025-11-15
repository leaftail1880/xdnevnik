import { Theme } from '@/models/theme'
import { Spacings } from '@/utils/Spacings'
import { observer } from 'mobx-react-lite'
import { View, ViewStyle } from 'react-native'
import { Text } from 'react-native-paper'

export const ChipLike = observer(function ChipLike({
	children,
  style
}: {
	children: React.ReactNode,
  style?: ViewStyle,
}) {
	return (
		<View
			style={[{
				backgroundColor: Theme.colors.secondaryContainer,
				borderRadius: Theme.roundness,
				padding: Spacings.s1 / 2,
			}, style]}
		>
			<Text
				style={{
					color: Theme.colors.onSecondaryContainer,
					fontWeight: 'bold',
				}}
			>
				{children}
			</Text>
		</View>
	)
})
