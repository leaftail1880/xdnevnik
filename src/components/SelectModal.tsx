import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import {
	ScrollView,
	StyleProp,
	StyleSheet,
	View,
	ViewStyle,
} from 'react-native'
import {
	Button,
	Chip,
	Dialog,
	List,
	Portal,
	RadioButton,
	Text,
	TouchableRipple,
} from 'react-native-paper'
import { Theme } from '~models/theme'
import { Spacings } from '../utils/Spacings'

class Store {
	constructor() {
		makeAutoObservable(this, {}, { autoBind: true })
	}

	visible = false

	toggleVisibility() {
		this.visible = !this.visible
	}
}

type Item<T extends string> = {
	value: T
	label: string
}

type Props<V extends string = string, I extends Item<V> = Item<V>> = {
	label: string
	value: V
	data: I[]
	onSelect: (v: I) => void
	mode?: 'button' | 'list.item' | 'chip'
	style?: StyleProp<ViewStyle>
	description?: string
}

export default observer(function SelectModal<
	V extends string,
	I extends Item<V>,
>(props: Props<V, I>) {
	Theme.key
	const [store] = useState(() => new Store())
	const value =
		props.data.find(e => e.value === props.value)?.label ?? 'Выбери...'

	let label = props.label
	if (label !== '') label += ': '

	return (
		<>
			{props.mode === 'button' ? (
				<Button
					onPress={store.toggleVisibility}
					style={[
						{
							borderTopLeftRadius: 0,
							borderTopRightRadius: 0,
							backgroundColor: Theme.colors.navigationBar,
						},
						props.style,
					]}
					labelStyle={[Theme.fonts.titleMedium, { padding: Spacings.s1 }]}
				>
					<Text variant="titleMedium">{label}</Text>
					{value}
				</Button>
			) : props.mode === 'chip' ? (
				<Chip
					style={props.style}
					textStyle={Theme.fonts.bodySmall}
					onPress={store.toggleVisibility}
				>
					{(label + value).slice(0, 16)}
				</Chip>
			) : (
				<List.Item
					style={props.style}
					title={props.label}
					description={value}
					onPress={store.toggleVisibility}
				></List.Item>
			)}
			<Modal {...props} store={store} />
		</>
	)
})

const Modal = observer(function Modal(props: Props & { store: Store }) {
	return (
		<Portal>
			<Dialog
				onDismiss={props.store.toggleVisibility}
				visible={props.store.visible}
			>
				<Dialog.Title>{props.label}</Dialog.Title>
				<ScrollView>
					{props.data.map(item => (
						<Option {...props} item={item} key={item.value} />
					))}
				</ScrollView>
				<Dialog.Actions>
					<Button onPress={props.store.toggleVisibility}>Свернуть</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	)
})

const Option = observer(function Option<T extends string = string>(
	props: Props<T> & {
		item: Item<T>
		store: Store
	},
) {
	Theme.key
	const { item, onSelect, store } = props
	const onPress = useCallback(() => {
		onSelect(item)
		store.toggleVisibility()
	}, [item, onSelect, store])

	return (
		<TouchableRipple onPress={onPress}>
			<View style={styles.row}>
				<View pointerEvents="none">
					<RadioButton
						value="normal"
						status={props.item.value === props.value ? 'checked' : 'unchecked'}
					/>
				</View>
				<Text style={styles.text}>{props.item.label}</Text>
			</View>
		</TouchableRipple>
	)
})

const styles = StyleSheet.create({
	container: {
		maxHeight: 280,
		paddingHorizontal: 0,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: Spacings.s2,
		paddingVertical: Spacings.s1,
	},
	text: {
		paddingLeft: 8,
	},
})
