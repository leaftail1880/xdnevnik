import NumberInput from '@/components/NumberInput'
import { SelectTime } from '@/components/SelectTime'
import { Size } from '@/components/Size'
import SwitchSetting from '@/components/SwitchSetting'
import { XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { API } from '@/services/net-school/api'
import { Spacings } from '@/utils/Spacings'
import { observable, runInAction } from 'mobx'
import { PersistStore, PersistStoreMap } from 'mobx-persist-store'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import { List, Text } from 'react-native-paper'
import { DatePickerInput } from 'react-native-paper-dates'

export default observer(function Appearance() {
	Theme.key

	const overrideTime = new Date(XSettings.overrideTimeD)
	return (
		<ScrollView>
			<List.Section title="Общие">
				<View style={{ paddingHorizontal: Spacings.s2 }}>
					<NumberInput
						label="Timeout"
						description="Максимальная длительность запроса, в секундах. Чем меньше значение, тем раньше приложение начнет использовать кеш вместо ожидания ответа от сервера"
						value={API.timeoutLimit}
						onChange={value => runInAction(() => (API.timeoutLimit = value))}
						defaultValue={6}
					/>
					<NumberInput
						label="Cache latency"
						description="Использовать кэш если паралельных запросов больше чем это число. Полезно для оптимизации большого кол-ва запросов. 0 заставляет все запросы возвращать кеш по умолчанию."
						value={API.useCacheOnMoreThenReqs}
						onChange={value =>
							runInAction(() => (API.useCacheOnMoreThenReqs = value))
						}
						defaultValue={6}
					/>
				</View>
				<View style={{ gap: Spacings.s2 }}>
					<SwitchSetting
						setting="useOverrideTime"
						title="Использовать кастомное время"
						description="Полезно для демонстрации"
					/>
					<View style={{ paddingHorizontal: Spacings.s2 }}>
						<SelectTime
							label="Время в приложении"
							value={{
								minutes: overrideTime.getMinutes(),
								hours: overrideTime.getHours(),
							}}
							onSelect={({ hours, minutes }) =>
								runInAction(() => {
									overrideTime.setHours(hours, minutes)
									XSettings.save({ overrideTimeD: overrideTime.getTime() })
								})
							}
							key={overrideTime.getTime().toString()}
						/>
						<DatePickerInput
							locale="ru"
							value={overrideTime}
							onChange={d =>
								!!d && XSettings.save({ overrideTimeD: d.getTime() })
							}
							inputMode="start"
						/>
					</View>
				</View>
			</List.Section>
			<List.Section title="Хранилище">
				<SizeOfCache />
				<List.Item
					title={
						<Text>
							Очистить кэш ({Object.keys(API.cache).length} значений,{' '}
							<Size t={API.cache} />)
						</Text>
					}
					onPress={() =>
						runInAction(() => ((API.cache = {}), delete stores['api']))
					}
				/>
				<Stores />
			</List.Section>
		</ScrollView>
	)
})

const SizeOfCache = observer(function SizeOfCache() {
	return (
		<List.Item
			title={
				<Text>
					Занятое место:{' '}
					<Size
						t={Object.entries(stores).reduce(
							(p, e) => p + JSON.stringify(e).length,
							0,
						)}
					/>
				</Text>
			}
		/>
	)
})

const ExportImportSettings = observer(function ExportImportSettings() {
	return (
		<>
			<List.Item title={<Text>Экспортировать</Text>} />
			<List.Item title={<Text>Импортировать</Text>} />
		</>
	)
})

// eslint-disable-next-line mobx/missing-observer
function Stores() {
	return [...PersistStoreMap.values()].map(e => (
		<Store store={e} key={e.storageName} />
	))
}

const stores: Record<string, unknown> = observable(
	{},
	{},
	{ defaultDecorator: observable.struct },
)

const Store = observer(function Store({
	store,
}: {
	store: PersistStore<unknown, never>
}) {
	useEffect(() => {
		store.getPersistedStore().then(e => {
			runInAction(() => {
				stores[store.storageName] = e
			})
		})
	})

	return (
		<List.Item
			title={
				<Text>
					{store.storageName}: <Size t={stores[store.storageName]} />
				</Text>
			}
		/>
	)
})
