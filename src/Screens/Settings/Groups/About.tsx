import * as Application from 'expo-application'
import * as updates from 'expo-updates'
import { Text, View } from 'react-native-ui-lib'
import { LANG } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme.store'

// eslint-disable-next-line mobx/missing-observer
export default function About() {
	return (
		<View padding-s3>
			<Text>Название: {Application.applicationName}</Text>
			<Text>Идентификатор: {Application.applicationId}</Text>
			<Text>Версия: {Application.nativeApplicationVersion}</Text>
			<Text>Версия сборки: {updates.updateId}</Text>
			<Text key={Theme.key}>{LANG['made_by']}</Text>
		</View>
	)
}
