import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { List } from 'react-native-paper'
import SwitchSetting from '~components/SwitchSetting'
import { Settings } from '~models/settings'
import { SettingsRoutes } from '../navigation'

export default observer(function Notifications(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	props: StackScreenProps<SettingsRoutes>,
) {
	return (
		<ScrollView>
			<List.Section title="Общие">
				<SwitchSetting
					title={'Включены ли уведомления'}
					setting="notificationsEnabled"
				/>

				<SwitchSetting
					title={'Расписание уроков'}
					description="Уведомления о текущих уроках"
					setting="lessonNotifications"
					disabled={!Settings.notificationsEnabled}
				/>

				<SwitchSetting
					title={'Новые оценки'}
					description="Уведомления о новых оценках"
					setting="marksNotifications"
					disabled={!Settings.notificationsEnabled}
				/>
			</List.Section>
		</ScrollView>
	)
})
