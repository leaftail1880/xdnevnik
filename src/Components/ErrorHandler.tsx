import * as Sentry from '@sentry/react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { NetSchoolApi, NetSchoolError } from '../NetSchool/api'
import { Theme } from '../Stores/Theme'

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
	const errorString = NetSchoolApi.stringifyError(error[1])
	const needAuth = error[1] instanceof NetSchoolError && error[1].beforeAuth
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
			{needAuth && <Text>Авторизуйтесь!</Text>}
			{errorString === NetSchoolApi.noConnection && (
				<Text>Вы не в сети, сетевая ошибка!</Text>
			)}
			{more && <Text>{errorString}</Text>}
			<View margin-s2>
				<Button onPress={() => setMore(!more)} margin-s1 padding-s2>
					<Text>{!more ? 'Подробнее' : 'Свернуть'}</Text>
				</Button>
				{/* eslint-disable-next-line react-native/no-raw-text */}
				<Button onPress={reload} icon="reload">
					Попробовать снова
				</Button>
				{!needAuth && (
					<Button
						onPress={() => {
							Sentry.captureException(error)
						}}
					>
						<Text>{'Отправить отчет об ошибке разработчику'}</Text>
					</Button>
				)}
			</View>
		</View>
	)
}
