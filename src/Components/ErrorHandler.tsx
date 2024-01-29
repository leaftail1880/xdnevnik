import * as Sentry from '@sentry/react-native'
import { useState } from 'react'
import { Colors, Spacings, Text, View } from 'react-native-ui-lib'
import { NetSchoolApi, NetSchoolError } from '../NetSchool/api'
import { Button } from './Button'
import { Ionicon } from './Icon'

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
			flex
			center
			margin-s1
			style={{
				alignSelf: 'center',
				maxWidth: 300,
			}}
		>
			<Text $textDanger style={{ fontSize: 20, fontWeight: 'bold' }}>
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
					<Text $textDefault>{!more ? 'Подробнее' : 'Свернуть'}</Text>
				</Button>
				<Button onPress={reload} margin-s1 padding-s2 row>
					<Text $textDefault>Попробовать снова</Text>
					<Ionicon
						name="reload"
						size={18}
						color={Colors.$textDefault}
						style={{ paddingLeft: Spacings.s1 }}
					/>
				</Button>
				{!needAuth && (
					<Button
						onPress={() => {
							Sentry.captureException(error)
						}}
						margin-s1
						padding-s2
					>
						<Text $textDefault>{'Отправить отчет об ошибке разработчику'}</Text>
					</Button>
				)}
			</View>
		</View>
	)
}
