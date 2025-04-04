import Mark from '@/components/Mark'
import { RoundedSurface } from '@/components/RoundedSurface'
import { styles } from '@/constants'
import { Settings, StudentSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { observer } from 'mobx-react-lite'
import { StyleProp, View, ViewStyle } from 'react-native'
import { Chip, Text } from 'react-native-paper'

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
			<ToFixMarkYouNeed student={student} toGetTarget={toGetTarget} />,
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
					<Text>нужно</Text>
					<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
						{toGetTarget}x
					</Text>

					<Mark
						duty={false}
						style={{
							padding: 0,
							paddingHorizontal: Spacings.s1,
							paddingVertical: 1,
						}}
						textStyle={{ fontSize: 8 }}
						subTextStyle={{ fontSize: 6 }}
						weight={student.defaultMarkWeight}
						mark={student.defaultMark}
						onPress={onPress}
					/>
				</RoundedSurface>
			)}
		</>
	)
})

const ToFixMarkYouNeed = observer(function ToFixMarkYouNeed({
	student,
	toGetTarget,
}: {
	student: StudentSettings
	toGetTarget: number
}) {
	return (
		<View
			style={{
				flexDirection: 'row',
				flexWrap: 'wrap',
				alignItems: 'center',
				padding: Spacings.s1,
				gap: Spacings.s1,
			}}
		>
			<Text>Чтобы в итогах было</Text>
			<Mark
				mark={student.targetMark}
				duty={false}
				style={{ paddingHorizontal: 2 }}
			/>
			<Text>нужно получить</Text>
			<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
				{toGetTarget}
			</Text>
			<Text>оценок вида</Text>
			<Mark
				duty={false}
				style={{ paddingHorizontal: Spacings.s1 }}
				textStyle={{ fontSize: 14 }}
				subTextStyle={{ fontSize: 10 }}
				weight={student.defaultMarkWeight}
				mark={student.defaultMark}
			/>
		</View>
	)
})
