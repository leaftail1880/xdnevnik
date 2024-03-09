import { observer } from 'mobx-react-lite'
import { Appbar } from 'react-native-paper'
import { Theme } from '../Stores/Theme'

export default observer(function Header(props: {
	title: string
	children?: React.ReactNode
}) {
	return (
		<Appbar.Header style={{ backgroundColor: Theme.colors.navigationBar }}>
			{props.children}
			<Appbar.Content
				titleStyle={{
					fontWeight: 'bold',
					fontSize: 20,
					color: Theme.colors.onSurface,
				}}
				title={props.title}
			/>
		</Appbar.Header>
	)
})
