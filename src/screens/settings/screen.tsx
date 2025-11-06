import Loading from '@/components/Loading'
import { SettingsJumpNavigation } from '@/components/Navigate'
import { XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { API } from '@/services/net-school/api'
import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { ScrollView, View } from 'react-native'

import Advanced from './advanced/Advanced'
import Appearance from './colors/Appearance'
import Marks from './marks/Marks'
import Notifications from './notifications/Notifications'
import PrivacyPolicy from './support/PrivacyPolicy'
import Support from './support/Support'
import TermsAndConditions from './support/TermsAndConditions'
import MicroUpdate from './update/micro-update'
import UpdatesScreen from './update/screen'

import SelectModal from '@/components/SelectModal'
import { StudentsStore } from '@/services/net-school/store'
import { Spacings } from '@/utils/Spacings'
import * as Application from 'expo-application'
import { memo } from 'react'
import { HelperText } from 'react-native-paper'
import {
	SETTINGS_ROUTES,
	SettingsNavigation,
	SettingsRoutes,
} from './navigation'

export default observer(function SettingsScreen() {
	Theme.key
	return (
		<SettingsNavigation.Navigator
			initialRouteName="main"
			screenOptions={a => ({
				title: SETTINGS_ROUTES[a.route.name],
				presentation: 'modal',
			})}
		>
			<SettingsNavigation.Screen name="main" component={MainSettings} />

			<SettingsNavigation.Screen name="notifs" component={Notifications} />
			<SettingsNavigation.Screen name="colors" component={Appearance} />
			<SettingsNavigation.Screen name="update" component={UpdatesScreen} />
			<SettingsNavigation.Screen name="advanced" component={Advanced} />
			<SettingsNavigation.Screen name="support" component={Support} />
			<SettingsNavigation.Screen name="marks" component={Marks} />

			<SettingsNavigation.Screen name="privacy" component={PrivacyPolicy} />
			<SettingsNavigation.Screen name="terms" component={TermsAndConditions} />
		</SettingsNavigation.Navigator>
	)
})

// eslint-disable-next-line mobx/missing-observer
const MainSettings = memo(function MainSettings(
	props: StackScreenProps<SettingsRoutes>,
) {
	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
			}}
		>
			<SelectStudent />
			<SettingsJumpNavigation
				navigation={props}
				target={'notifs'}
				description="О текущих уроках, о новых оценках"
			/>

			<SettingsJumpNavigation
				navigation={props}
				target={'marks'}
				description={'Вид, оценка по умолчанию и др.'}
			/>
			<SettingsJumpNavigation
				navigation={props}
				target={'colors'}
				description="Тема, цвет акцента и др."
			/>
			<SettingsJumpNavigation
				navigation={props}
				target={'update'}
				description="Обновления приложения"
			/>
			<SettingsJumpNavigation
				navigation={props}
				target={'advanced'}
				description="Настройки для разработчиков"
			/>
			<SettingsJumpNavigation
				navigation={props}
				target={'support'}
				description={'Тех поддержка и юр. сведения'}
			/>
			<View style={{ alignItems: 'center', margin: Spacings.s2 }}>
				<HelperText type="info">
					{Application.applicationName} {Application.nativeApplicationVersion}{' '}
					<MicroUpdate />
				</HelperText>
			</View>
		</ScrollView>
	)
})

const SelectStudent = observer(function SelectStudent() {
	return API.session ? (
		StudentsStore.fallback || (
			<SelectModal
				data={StudentsStore.result.map((student, index) => ({
					value: index + '',
					label: XSettings.fullname(student.name),
				}))}
				mode="list.item"
				value={XSettings.studentIndex + ''}
				onSelect={student =>
					XSettings.save({ studentIndex: Number(student.value) })
				}
				label={'Ученик'}
			/>
		)
	) : (
		<Loading text="Для выбора ученика авторизуйтесь" />
	)
})
