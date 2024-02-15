import { observer } from 'mobx-react-lite'
import { Appbar } from 'react-native-paper'
import { Spacings, Text } from 'react-native-ui-lib'
import { Theme } from '../Stores/Theme.store'

export const Header = observer(function Header(props: { title: string }) {
	return (
		<Appbar.Header
			style={{
				backgroundColor: Theme.theme.colors.card,
			}}
		>
			<Text
				style={{
					fontSize: 20,
					color: Theme.theme.colors.text,
					fontWeight: '600',
					paddingLeft: Spacings.s2,
				}}
			>
				{props.title}
			</Text>
		</Appbar.Header>
	)
})
