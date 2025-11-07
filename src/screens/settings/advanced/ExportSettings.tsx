import { Size } from '@/components/Size'
import { getStorageValue, setStorageValue } from '@/utils/configure'
import { ModalAlert } from '@/utils/Toast'
import { nativeApplicationVersion } from 'expo-application'
import { File, Paths } from 'expo-file-system'
import { isAvailableAsync, shareAsync } from 'expo-sharing'
import { PersistStoreMap } from 'mobx-persist-store'
import { observer } from 'mobx-react-lite'
import { List, Text } from 'react-native-paper'

const currentFormatVersion = 1

interface ExportedXDnevnikSettingsFormat {
	formatVersion: typeof currentFormatVersion // future proof
	appVersion: string // 0.18.0
	storages: {
		formatVersion: typeof currentFormatVersion // future proof
		id: string
		content: string
	}[]
}

export const ExportImportSettings = observer(function ExportImportSettings() {
	return (
		<>
			<List.Item
				title={<Text>Экспортировать</Text>}
				onPress={async () => {
					try {
						if (!(await isAvailableAsync()))
							throw new Error('Невозможно на вашей платформе')

						const storages = await Promise.all(
							[...PersistStoreMap.values()].map(store =>
								store
									.getPersistedStore()
									.then(p => ({ storage: p, key: store.storageName })),
							),
						)

						const exportedStorage: ExportedXDnevnikSettingsFormat = {
							formatVersion: currentFormatVersion,
							appVersion: nativeApplicationVersion ?? '0.0.0',
							storages: storages
								.map(e => ({
									formatVersion: currentFormatVersion,
									id: e.key,
									content: getStorageValue(e.key),
								}))
								.filter(e => !!e.content),
						}

						const file = new File(Paths.cache, 'settingsExport.json')
						if (!file.exists) file.create({ overwrite: true })
						file.write(JSON.stringify(exportedStorage))
						shareAsync(file.uri, { mimeType: 'application/json' })
					} catch (e) {
						ModalAlert.show('Ошибка', e + '', true)
					}
				}}
			/>
			<List.Item
				title={<Text>Импортировать</Text>}
				onPress={async () => {
					try {
						const file = await File.pickFileAsync(undefined, 'application/json')
						if (Array.isArray(file))
							return ModalAlert.show(
								'Ошибка',
								'Вы выбрали несколько файлов, а нужен только один!',
								true,
							)

						const text = await file.text()

						let json: unknown
						try {
							json = JSON.parse(text)
						} catch (e) {
							ModalAlert.show(
								'Ошибка формата JSON',
								'Убедитесь, что он является валидным JSON файлом, ошибка: ' + e,
								true,
							)
							return
						}
						if (
							typeof json !== 'object' ||
							!json ||
							!('formatVersion' in json) ||
							typeof json.formatVersion !== 'number'
						)
							return ModalAlert.show(
								'Отсутствует версия в файле',
								'Убедитесь что вы выбрали тот файл',
								true,
							)

						if (json.formatVersion > currentFormatVersion)
							return ModalAlert.show(
								'Слишком новый файл',
								`Ожидался файл версии ${currentFormatVersion}, получен ${json.formatVersion}`,
							)

						const validExport = json as ExportedXDnevnikSettingsFormat

						if (
							!('appVersion' in validExport) ||
							!('storages' in validExport) ||
							typeof validExport.appVersion !== 'string' ||
							!Array.isArray(validExport.storages) ||
							!validExport.storages.length
						)
							return ModalAlert.show(
								'Отсутствуют нужные поля в файле',
								'Убедитесь что файл не поврежден',
								true,
							)

						const errors: string[] = []
						for (const storage of validExport.storages) {
							try {
								if (!storage.content) continue

								const store = [...PersistStoreMap.values()].find(
									e => e.storageName === storage.id,
								)
								if (!store) {
									errors.push('В этой версии нет хранилища ' + storage.id)
									continue
								}

								if (!store) throw new Error('No store with id ' + storage.id)
								setStorageValue(storage.id, storage.content)
								store.hydrateStore()
							} catch (e) {
								errors.push(e + '')
							}
						}

						ModalAlert.show(
							'Готово!',
							<Text>
								Импортированы хранилища:{'\n'}
								{validExport.storages.map(e => (
									<Text key={e.id}>
										{e.id} <Size t={e.content} />
										{'\n'}
									</Text>
								))}
								{errors.length ? `\n\nОшибки:\n${errors.join('\n')}` : ''}{' '}
							</Text>,
						)
					} catch (e) {
						ModalAlert.show('Ошибка', e + '', true)
					}
				}}
			/>
		</>
	)
})
