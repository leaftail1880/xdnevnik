import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { View } from 'react-native'
import { HelperText, Text, TextProps } from 'react-native-paper'

export const ScrollTextCopyable = observer(function ScrollTextCopyable(
	props: TextProps<string>
) {
	const onLongPress = useCallback(() => {
		ModalAlert.show(
			'Задание',
			<View style={{ gap: Spacings.s2 }}>
				<Text selectable>{props.children}</Text>

				<HelperText type="info">
					Подсказка: текст можно выделить и скопировать
				</HelperText>
			</View>
		)
	}, [props.children])

	return <Text onLongPress={onLongPress} {...props}></Text>
})
