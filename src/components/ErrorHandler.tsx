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

export function ErrorHandler({ error, reload, name }: ErrorHandlerProps) {
	const [more, setMore] = useState<boolean>(false)
	const errorString = NetSchoolApi.stringifyError(error[1])
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
			<Text $textDanger>Ошибка{error[0] ? ` (${error[0]})` : ''}</Text>
			<Text>При загрузке {name}</Text>
			{error[1] instanceof NetSchoolError && error[1].beforeAuth && (
				<Text>Авторизуйтесь!</Text>
			)}
			{errorString === NetSchoolApi.noConnection && (
				<Text>Вы не в сети, сетевая ошибка!</Text>
			)}
			{more && <Text>{errorString}</Text>}
			<Button
				onPress={() => setMore(!more)}
				margin-s1
				padding-0
				style={{ minHeight: 15, width: '100%' }}
			>
				<Text $textDefault>{!more ? 'Подробнее' : 'Свернуть'}</Text>
			</Button>
			<Button
				onPress={reload}
				margin-s1
				padding-0
				style={{ maxHeight: 50, width: '100%' }}
			>
				<View flex row spread center margin-0 padding-s1>
					<Text $textDefault>Попробовать снова</Text>
					<Ionicon
						name="reload"
						size={15}
						color={Colors.$textDefault}
						style={{ paddingLeft: Spacings.s2 }}
					/>
				</View>
			</Button>
		</View>
	)
}
