import Mark from '@/components/Mark'
import { RoundedSurface } from '@/components/RoundedSurface'
import { styles } from '@/constants'
import { Settings, StudentSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { ToGetMarkTargetCalculated } from '@/utils/calculateMarks'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { observer } from 'mobx-react-lite'
import { StyleProp, View, ViewStyle } from 'react-native'
import { Chip, Text } from 'react-native-paper'

// eslint-disable-next-line mobx/missing-observer
export function ToGetMarkChips({
	toGetMarks,
}: {
	toGetMarks: ToGetMarkTargetCalculated[]
}) {
	return toGetMarks.map((e, _, a) => (
		<ToGetMarkChip
			key={e.target.toString()}
			amount={e.amount}
			target={e.target}
			// Show in full mode because there are different types of marks
			compact={a.length > 1 ? false : undefined}
		/>
	))
}

const ToGetMarkChip = observer(function ToGetMarkChip({
	amount,
	target,
	compact = Settings.targetMarkCompact,
	style,
}: {
	amount: number | undefined
	target?: number
	compact?: boolean
	style?: StyleProp<ViewStyle>
}) {
	const { studentId } = Settings
	if (!studentId) return
	if (typeof amount !== 'number') return

	const student = Settings.forStudent(Settings.studentId!)
	target ??= student.targetMark

	if (amount === 0) {
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
				Исправить до {} невозможно
			</Chip>
		)
	}

	const onPress = () =>
		ModalAlert.show(
			`Можно исправить оценку!`,
			<ToFixMarkYouNeed student={student} amount={amount} target={target} />,
		)

	return (
		<>
			{compact && (
				<Chip mode="flat" compact style={style} onPress={onPress}>
					<Text>Нужно </Text>
					<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
						{amount}x
					</Text>
				</Chip>
			)}
			{!compact && (
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
						mark={target}
						duty={false}
						style={{ padding: 2 }}
						onPress={onPress}
					/>
					<Text>нужно</Text>
					<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
						{amount}x
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
	amount,
	target,
}: {
	student: StudentSettings
	amount: number
	target: number | undefined
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
			<Mark mark={target} duty={false} style={{ paddingHorizontal: 2 }} />
			<Text>нужно получить</Text>
			<Text style={{ fontWeight: 'bold', color: Theme.colors.primary }}>
				{amount}
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
