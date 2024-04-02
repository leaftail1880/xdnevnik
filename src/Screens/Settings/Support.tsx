import { StackScreenProps } from '@react-navigation/stack'
import * as Application from 'expo-application'
import { Linking, ScrollView, View } from 'react-native'
import { Divider, List, Text } from 'react-native-paper'
import { LANG } from '../../Setup/constants'
import { Spacings } from '../../utils/Spacings'
import { SettingsJumpNavigation } from './Components/Navigate'
import { SettingsRoutes } from './navigation'

// eslint-disable-next-line mobx/missing-observer
export default function About(props: StackScreenProps<SettingsRoutes>) {
	return (
		<ScrollView contentContainerStyle={{ flex: 1 }}>
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
				<Text>{LANG['made_by']}</Text>
			</View>
		</ScrollView>
	)
}
