import { StackScreenProps } from '@react-navigation/stack'
import * as Application from 'expo-application'
import { Linking, ScrollView, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { Spacings } from '../../../Components/Spacings'
import { LANG } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme'
import { SettingsJumpNavigation } from '../Components/Navigate'
import { SettingsRoutes } from '../SettingsNavigation'

// eslint-disable-next-line mobx/missing-observer
export default function About(props: StackScreenProps<SettingsRoutes>) {
	return (
		<ScrollView contentContainerStyle={{ flex: 1, padding: Spacings.s2 }}>
			<SettingsJumpNavigation navigation={props} target={'privacy'} />
			<SettingsJumpNavigation navigation={props} target={'terms'} />
			<Button
				icon="github"
				onPress={() => {
					Linking.openURL('https://github.com/leaftail1880/xdnevnik')
				}}
				labelStyle={Theme.theme.fonts.titleMedium}
			>
				Исходный код на GitHub
			</Button>
			<View style={{ padding: Spacings.s2 }}>
				<Text>Название: {Application.applicationName}</Text>
				<Text>Версия: {Application.nativeApplicationVersion}</Text>
				<Text>Идентификатор: {Application.applicationId}</Text>
				<Text>{LANG['made_by']}</Text>
			</View>
		</ScrollView>
	)
}
