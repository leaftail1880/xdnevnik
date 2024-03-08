import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import {
	Button,
	Dialog,
	List,
	Portal,
	RadioButton,
	Text,
	TouchableRipple,
} from 'react-native-paper'
import { Theme } from '../Stores/Theme'
import { Spacings } from '../utils/Spacings'

export default observer(function SelectModal<
	T extends string,
	D extends { value: T; label: string }
>(props: {
	label: string
	value: T
	data: D[]
	onSelect: (v: D) => void
	mode?: 'button' | 'list.item'
	description?: string
}) {
	Theme.key
	const [visible, setVisible] = useState(false)
	const value =
		props.data.find(e => e.value === props.value)?.label ?? 'Выбери...'

	return (
		<>
			{props.mode === 'button' ? (
				<Button
					onPress={() => setVisible(!visible)}
					style={{
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
						backgroundColor: Theme.colors.elevation.level2,
					}}
					labelStyle={[Theme.fonts.titleMedium, { padding: Spacings.s1 }]}
				>
					<Text variant="titleMedium">{props.label}: </Text>
					{value}
				</Button>
			) : (
				<List.Item
					title={props.label}
					description={value}
					onPress={() => setVisible(!visible)}
				></List.Item>
			)}
			<Portal>
				<Dialog onDismiss={() => setVisible(!visible)} visible={visible}>
					<Dialog.Title>{props.label}</Dialog.Title>
					<ScrollView>
						{props.data.map(item => (
							<TouchableRipple
								onPress={() => props.onSelect(item)}
								key={item.value}
							>
								<View style={styles.row}>
									<View pointerEvents="none">
										<RadioButton
											value="normal"
											status={
												item.value === props.value ? 'checked' : 'unchecked'
											}
										/>
									</View>
									<Text style={styles.text}>{item.label}</Text>
								</View>
							</TouchableRipple>
						))}
					</ScrollView>
					<Dialog.Actions>
						<Button onPress={() => setVisible(!visible)}>Свернуть</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</>
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
