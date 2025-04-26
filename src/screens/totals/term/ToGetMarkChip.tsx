import Mark from '@/components/Mark'
import { RoundedSurface } from '@/components/RoundedSurface'
import { globalStyles } from '@/constants'
import { StudentSettings, XSettings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { ToGetMarkTargetCalculated } from '@/utils/calculateMarks'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { useStyles } from '@/utils/useStyles'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
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

const onImpossiblePress = () =>
	ModalAlert.show('Исправить оценку невозможно', 'Недостаточно уроков', true)

interface ToGetMarkProps {
	amount: number | undefined
	target?: number
	compact?: boolean
	style?: StyleProp<ViewStyle>
}

const ToGetMarkChip = observer(function ToGetMarkChip(props: ToGetMarkProps) {
	const { studentId } = XSettings
	if (!studentId) return
	const amount = props.amount
	if (typeof amount !== 'number') return

	const student = XSettings.forStudent(XSettings.studentId!)

	if (amount === 0) {
		return <ToGetMarkChipImpossible {...props} />
	} else {
		return (
			<ToGetMarkChipPossible {...props} amount={amount} student={student} />
		)
	}
})

const ToGetMarkChipImpossible = observer(function ToGetMarkChipImpossible(
	props: ToGetMarkProps,
) {
	const impossibleChipStyle = useStyles(() => [
		{ backgroundColor: Theme.colors.errorContainer },
		props.style,
	])

	return (
		<Chip
			mode="flat"
			compact
			style={impossibleChipStyle}
			onPress={onImpossiblePress}
		>
			Исправить до {props.target} невозможно
		</Chip>
	)
})

const ToGetMarkChipPossible = observer(function ToGetMarkChipPossible({
	compact = XSettings.targetMarkCompact,
	student,
	amount,
	target = student.targetMark,
	style,
}: {
	student: StudentSettings
	amount: number
} & ToGetMarkProps) {
	const onPress = useCallback(
		() =>
			ModalAlert.show(
				`Можно исправить оценку!`,
				<ToFixMarkYouNeed student={student} amount={amount} target={target} />,
			),
		[student, amount, target],
	)

	return (
		<>
			{compact && (
				<Chip mode="flat" compact style={style} onPress={onPress}>
					<Text variant="labelLarge">Нужно </Text>
					<Text
						variant="labelLarge"
						style={{ fontWeight: 'bold', color: Theme.colors.primary }}
					>
						{amount}x
					</Text>
				</Chip>
			)}
			{!compact && (
				<RoundedSurface
					style={[
						globalStyles.stretch,
						{
							gap: Spacings.s1,
							backgroundColor: Theme.colors.secondaryContainer,
							marginHorizontal: 0,
							padding: Spacings.s1,
						},
						style,
					]}
				>
					<Text variant="labelLarge">До</Text>
					<Mark
						mark={target}
						duty={false}
						style={{ padding: 2 }}
						onPress={onPress}
					/>
					<Text variant="labelLarge">нужно</Text>
					<Text
						variant="labelLarge"
						style={{ fontWeight: 'bold', color: Theme.colors.primary }}
					>
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
