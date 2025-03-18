import { Theme } from '@/models/theme'
import { NetSchoolError } from '@/services/net-school/api'
import { Spacings } from '@/utils/Spacings'
import { useState } from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { RequestError, RequestErrorReason } from '../utils/RequestError'

interface ErrorHandlerProps {
	error: [number, Error]
	reload: () => void
	name: string
}

// eslint-disable-next-line mobx/missing-observer
export default function ErrorHandler({
	error,
	reload,
	name,
}: ErrorHandlerProps) {
	const [more, setMore] = useState<boolean>(false)
	const errorString = RequestError.stringify(error[1])
	const useCache = error[1] instanceof NetSchoolError && error[1].useCache
	return (
		<View
			style={{
				flex: 1,
				width: '100%',
				alignItems: 'center',
			}}
		>
			<Text
				style={{
					fontSize: 18,
					fontWeight: 'bold',
					color: Theme.colors.error,
				}}
			>
				Ошибка{error[0] ? ` (${error[0]})` : ''}
			</Text>
			<Text>При загрузке данных {name}</Text>
			{useCache && <Text>Нет данных в кэше для отображения.</Text>}
			{errorString === RequestErrorReason.noConnection && <Text>Нет сети</Text>}
			{more && <Text selectable>{errorString}</Text>}

			<View style={{ gap: Spacings.s2, margin: Spacings.s2 }}>
				<Button onPress={() => setMore(!more)} mode="elevated">
					<Text>{!more ? 'Подробнее' : 'Свернуть'}</Text>
				</Button>
				<Button onPress={reload} icon="reload" mode="elevated">
					Попробовать снова
				</Button>
				{/* {!beforeAuth && (
					<Button
						onPress={() => {
							Sentry.captureException(error)
						}}
					>
						<Text>Отправить отчет об ошибке разработчику</Text>
					</Button>
				)} */}
			</View>
		</View>
	)
}
