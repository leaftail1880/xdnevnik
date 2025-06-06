import { Theme } from '@/models/theme'
import { Spacings } from '@/utils/Spacings'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

export const ChipLike = observer(function ChipLike({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<View
			style={{
				backgroundColor: Theme.colors.secondaryContainer,
				borderRadius: Theme.roundness,
				padding: Spacings.s1 / 2,
			}}
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
