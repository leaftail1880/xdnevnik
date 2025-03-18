import { SettingsJumpNavigation } from '@/components/Navigate'
import { StackScreenProps } from '@react-navigation/stack'
import * as Application from 'expo-application'
import { useState } from 'react'
import { Linking, ScrollView, View } from 'react-native'
import { Button, Divider, List, Text } from 'react-native-paper'
import WebView from 'react-native-webview'
import { Spacings } from '../../../utils/Spacings'
import { SettingsRoutes } from '../navigation'

// eslint-disable-next-line mobx/missing-observer
export default function About(props: StackScreenProps<SettingsRoutes>) {
	const [dino, setDino] = useState(false)

	return (
		<ScrollView>
			<SettingsJumpNavigation
				navigation={props}
				target={'privacy'}
				description={''}
			/>
			<SettingsJumpNavigation
				navigation={props}
				target={'terms'}
				description={''}
			/>

			<List.Item
				onPress={() => {
					Linking.openURL('https://leaftail1880.github.io/xdnevnik')
				}}
				title="Официальный сайт"
				left={props => <List.Icon {...props} icon="web" />}
			/>
			<Divider />

			<List.Item
				onPress={() => {
					Linking.openURL('https://t.me/xdnevnikoffical')
				}}
				title="Новости приложения"
				left={props => <List.Icon {...props} icon="send" />}
			/>
			<Divider />

			<List.Item
				onPress={() => {
					Linking.openURL('https://t.me/xdnevniksupport')
				}}
				title="Тех. поддержка"
				left={props => <List.Icon {...props} icon="send" />}
			/>
			<Divider />
			<List.Item
				onPress={() => {
					Linking.openURL('https://github.com/leaftail1880/xdnevnik')
				}}
				left={props => <List.Icon {...props} icon="github" />}
				title="Исходный код на GitHub"
			/>
			<Divider />

			<View style={{ padding: Spacings.s2 }}>
				<Text>Название: {Application.applicationName}</Text>
				<Text>Версия: {Application.nativeApplicationVersion}</Text>
				<Text>Идентификатор: {Application.applicationId}</Text>
				<Text>Сделано с ❤️ Leaftail и Milk_Cool</Text>
				<Button onPress={() => setDino(!dino)}>Show Google Dino</Button>
			</View>
			{dino && (
				<View style={{ marginBottom: Spacings.s5 }}>
					<WebView
						source={{ uri: 'https://chromedino.com/' }}
						style={{ width: '100%', height: 600 }}
					></WebView>
				</View>
			)}
		</ScrollView>
	)
}
