import * as Sentry from '@sentry/react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { NetSchoolError } from '../NetSchool/api'
import { Theme } from '../Stores/Theme'
import { RequestError } from '../utils/RequestError'

interface ErrorHandlerProps {
	error: [number, Error]
	reload: () => void
	name: string
}

// eslint-disable-next-line mobx/missing-observer
export const ErrorHandler = function ErrorHandler({
	error,
	reload,
	name,
}: ErrorHandlerProps) {
	const [more, setMore] = useState<boolean>(false)
	const errorString = RequestError.stringify(error[1])
	const beforeAuth = error[1] instanceof NetSchoolError && error[1].useCache
	return (
		<View
			style={{
				flex: 1,
				alignContent: 'center',
				justifyContent: 'center',
				alignSelf: 'center',
				maxWidth: 300,
			}}
		>
			<Text
				style={{
					fontSize: 20,
					fontWeight: 'bold',
					color: Theme.colors.error,
				}}
			>
				Ошибка{error[0] ? ` (${error[0]})` : ''}
			</Text>
			<Text>При загрузке {name}</Text>
			{beforeAuth && <Text>Авторизуйтесь!</Text>}
			{errorString === RequestError.reasons.noConnection && (
				<Text>Нет сети</Text>
			)}
			{more && <Text>{errorString}</Text>}
			<View>
				<Button onPress={() => setMore(!more)}>
					<Text>{!more ? 'Подробнее' : 'Свернуть'}</Text>
				</Button>
				<Button onPress={reload} icon="reload">
					Попробовать снова
				</Button>
				{!beforeAuth && (
					<Button
						onPress={() => {
							Sentry.captureException(error)
						}}
					>
						<Text>Отправить отчет об ошибке разработчику</Text>
					</Button>
				)}
			</View>
		</View>
	)
}
