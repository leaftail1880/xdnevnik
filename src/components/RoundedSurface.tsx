import { observer } from 'mobx-react-lite'
import { Surface, SurfaceProps } from 'react-native-paper'
import { Theme } from '~models/theme'
import { Spacings } from '~utils/Spacings'

export const RoundedSurface = observer(function RoundedSurface(
	props: SurfaceProps,
) {
	return (
		<Surface
			{...props}
			style={[
				{
					borderRadius: Theme.roundness * 2,
					padding: Spacings.s2,
					marginHorizontal: Spacings.s1,
				},
				props.style,
			]}
		/>
	)
})
