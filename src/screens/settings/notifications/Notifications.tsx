import notifee from '@notifee/react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef, useState } from 'react'
import { Linking, ScrollView, View } from 'react-native'
import { Button, HelperText, List, Text } from 'react-native-paper'
import SwitchSetting from '~components/SwitchSetting'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import {
	checkForNewMarksAndNotify,
	MarksNotificationStore,
} from '~services/notifications/marks'
import { Spacings } from '~utils/Spacings'
import { SettingsRoutes } from '../navigation'

function usePromise<T>(promise: () => Promise<T>) {
	const [state, setState] = useState<T | undefined>(undefined)

	const interval = useRef<number | undefined | NodeJS.Timeout>()
	useEffect(() => {
		clearInterval(interval.current)
		interval.current = setInterval(() => {
			promise().then(e => {
				if (state !== e) setState(e)
			})
		}, 2000)
	})

	return state
}

export default observer(function Notifications(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	props: StackScreenProps<SettingsRoutes>,
) {
	const batteryOptimizations = !!usePromise(() =>
		notifee.isBatteryOptimizationEnabled(),
	)
	const powerManager = !!usePromise(() =>
		notifee.getPowerManagerInfo().then(e => e.activity),
	)

	const [logs, setLogs] = useState(false)

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
			<View style={{ padding: Spacings.s2, gap: Spacings.s2 }}>
				{(batteryOptimizations || powerManager) && (
					<HelperText type="error">Уведомления могут не работать</HelperText>
				)}
				<Warning
					enabled={batteryOptimizations}
					label="Оптимизация батареи"
					description="Включена оптимизация батареи. Система выключит приложение и уведомления перестанут работать"
					onPress={notifee.openBatteryOptimizationSettings}
				/>
				{powerManager && (
					<Warning
						enabled={false}
						label="Менеджер питания"
						description="Включен менеджер питания. Система выключит приложение и уведомления перестанут работать."
						onPress={notifee.openPowerManagerSettings}
					/>
				)}
				<Button mode="elevated" onPress={Linking.openSettings}>
					Системные настройки приложения
				</Button>
				<Button mode="elevated" onPress={checkForNewMarksAndNotify}>
					Проверить наличие новых оценок
				</Button>
				<Button mode="elevated" onPress={() => setLogs(!logs)}>
					Логи уведомлений об оценках
				</Button>
				{logs && (
					<Button
						mode="elevated"
						onPress={() => MarksNotificationStore.clearLogs()}
					>
						Очистить логи
					</Button>
				)}
			</View>
			{logs && (
				<Text style={{ padding: Spacings.s1 }} selectable>
					{MarksNotificationStore.logs.join('\n')}
				</Text>
			)}
		</ScrollView>
	)
})

const Warning = observer(function Warning(props: {
	enabled: boolean
	onPress: VoidFunction
	description: string
	label: string
}) {
	return (
		<>
			<Button
				mode="elevated"
				{...(props.enabled ? Theme.destructiveButton : {})}
				onPress={props.onPress}
			>
				{props.label}
			</Button>
			{props.enabled && (
				<HelperText type="error">{props.description}</HelperText>
			)}
		</>
	)
})
