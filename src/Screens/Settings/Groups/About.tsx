import { StackScreenProps } from '@react-navigation/stack'
import * as Application from 'expo-application'
import { Linking, ScrollView } from 'react-native'
import { Text, TouchableOpacity, View } from 'react-native-ui-lib'
import { Ionicon } from '../../../Components/Icon'
import { LANG } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme.store'
import { SettingsJumpNavigation } from '../Components/Navigate'
import { SettingsRoutes } from '../SettingsNavigation'

// eslint-disable-next-line mobx/missing-observer
export default function About(props: StackScreenProps<SettingsRoutes>) {
	return (
		<ScrollView contentContainerStyle={{ flex: 1 }}>
			<SettingsJumpNavigation navigation={props} target={'privacy'} />
			<SettingsJumpNavigation navigation={props} target={'terms'} />
			<View padding-s3>
				<Text>Название: {Application.applicationName}</Text>
				<Text>Версия: {Application.nativeApplicationVersion}</Text>
				<Text>Идентификатор: {Application.applicationId}</Text>
				<Text key={Theme.key}>{LANG['made_by']}</Text>
				<TouchableOpacity
					centerV
					row
					onPress={() => {
						Linking.openURL('https://github.com/leaftail1880/xdnevnik')
					}}
				>
					<Text underline marginR-s1>
						Исходный код на GitHub
					</Text>
					<Ionicon name="logo-github" size={23} />
				</TouchableOpacity>
			</View>
		</ScrollView>
	)
}
