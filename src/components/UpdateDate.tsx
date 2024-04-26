import { observer } from 'mobx-react-lite'
import { Text } from 'react-native-paper'
import { Theme } from '../models/theme'
import { Spacings } from '../utils/Spacings'

export default observer(function UpdateDate(props: {
	store: { updateDate: string }
}) {
	return (
		<Text
			style={{
				color: Theme.colors.onSurfaceDisabled,
				margin: Spacings.s2,
				marginBottom: Spacings.s4,
				alignSelf: 'center',
			}}
		>
			{props.store.updateDate}
		</Text>
	)
})
