import { observer } from 'mobx-react-lite'
import { StyleProp, View, ViewStyle } from 'react-native'
import { Chip, Text } from 'react-native-paper'
import Mark from '~components/Mark'
import { RoundedSurface } from '~components/RoundedSurface'
import { styles } from '~constants'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import { Spacings } from '~utils/Spacings'
import { ModalAlert } from '~utils/Toast'

export const ToGetMarkChip = observer(function ToGetMarkChip({
	toGetTarget,
	style,
}: {
	toGetTarget: number | undefined
	style?: StyleProp<ViewStyle>
}) {
	const { studentId } = Settings
	if (!studentId) return
	if (typeof toGetTarget !== 'number') return

	const student = Settings.forStudent(Settings.studentId!)
	if (toGetTarget === 0) {
		return (
			<Chip
				mode="flat"
				compact
				style={[{ backgroundColor: Theme.colors.errorContainer }, style]}
				onPress={() =>
					ModalAlert.show(
						'Исправить оценку невозможно',
						'Недостаточно уроков',
						true,
					)
				}
			>
				Исправить до {student.targetMark} невозможно
			</Chip>
		)
	}

	const onPress = () =>
		ModalAlert.show(
			`Можно исправить оценку!`,
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					flexWrap: 'wrap',
					margin: Spacings.s2,
					gap: Spacings.s1,
				}}
			>
				<Text>Чтобы чтобы в итогах было</Text>
				<Mark mark={student.targetMark} duty={false} style={{ padding: 2 }} />
				<Text>нужно получить</Text>
				<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
					{toGetTarget}
				</Text>
				<Text>оценок вида</Text>
				<Mark
					duty={false}
					style={{ padding: 0, paddingHorizontal: Spacings.s2 }}
					textStyle={{ fontSize: 10 }}
					subTextStyle={{ fontSize: 8 }}
					weight={student.defaultMarkWeight}
					mark={student.defaultMark}
				/>
			</View>,
		)

	return (
		<>
			{Settings.targetMarkCompact && (
				<Chip mode="flat" compact style={style} onPress={onPress}>
					<Text>Нужно </Text>
					<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
						{toGetTarget}x
					</Text>
				</Chip>
			)}
			{!Settings.targetMarkCompact && (
				<RoundedSurface
					style={[
						styles.stretch,
						{
							gap: Spacings.s1,
							backgroundColor: Theme.colors.secondaryContainer,
							marginHorizontal: 0,
							padding: Spacings.s1,
						},
						style,
					]}
				>
					<Text>До</Text>
					<Mark
						mark={student.targetMark}
						duty={false}
						style={{ padding: 2 }}
						onPress={onPress}
					/>
					<Text>нужно </Text>
					<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
						{toGetTarget}x
					</Text>

					<Mark
						duty={false}
						style={{ padding: 0, paddingHorizontal: Spacings.s2 }}
						textStyle={{ fontSize: 10 }}
						subTextStyle={{ fontSize: 8 }}
						weight={student.defaultMarkWeight}
						mark={student.defaultMark}
						onPress={onPress}
					/>
				</RoundedSurface>
			)}
		</>
	)
})
