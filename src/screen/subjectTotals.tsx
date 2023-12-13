import { StackScreenProps } from '@react-navigation/stack'
import { useContext, useState } from 'react'
import { Alert, ScrollView } from 'react-native'
import {
	Colors,
	Switch,
	Text,
	TextField,
	TextFieldProps,
	View,
} from 'react-native-ui-lib'
import { API } from '../NetSchool/api'
import { SubjectPerformance } from '../NetSchool/classes'
import {
	Button,
	IconButton,
	IconButtonProps,
	buttonStyle,
} from '../components/Button'
import { Ionicon } from '../components/Icon'
import { Mark } from '../components/Mark'
import { SubjectName } from '../components/SubjectName'
import { LANG, fullname } from '../constants'
import { useAPI } from '../hooks/api'
import { Ctx } from '../hooks/settings'
import type { MarkInfo, ParamMap } from './totals'

export function SubjectTotals({
	route,
}: StackScreenProps<ParamMap, (typeof LANG)['s_subject_totals']>) {
	const { termId, subjectId, finalMark } = route.params ?? {}
	const { studentId, settings } = useContext(Ctx)
	const {
		result: totals,
		fallback: FallbackTotals,
		updateDate: totalsUpdateDate,
		refreshControl,
	} = useAPI(
		API,
		'subjectPerformance',
		{ termId, studentId, subjectId },
		'итогов по предмету'
	)
	const [lessonsWithoutMark, setLessonsWithoutMark] = useState(false)
	const [customMarks, setCustomMarks] = useState<Partial<MarkInfo>[]>([])

	if (FallbackTotals) return FallbackTotals

	const { avgMark, totalsAndSheduledTotals, maxWeight, minWeight } =
		caclulateMarks({ totals, lessonsWithoutMark, customMarks })

	return (
		<ScrollView refreshControl={refreshControl}>
			<View flex row spread padding-s2 centerV>
				<SubjectName
					subjectName={totals.subject.name}
					subjectId={totals.subject.id}
					iconsSize={20}
					style={{
						fontSize: 20,
						fontWeight: 'bold',
						color: Colors.$textDefault,
					}}
					margin-s1
				/>
				<Mark
					duty={false}
					finalMark={finalMark}
					mark={avgMark}
					style={{ height: 50, width: 60 }}
					textStyle={{ fontSize: 20 }}
				/>
			</View>
			<View flex row spread padding-s2 centerV>
				<Text flex row>
					Уроки без оценок
				</Text>
				<Switch
					value={lessonsWithoutMark}
					onValueChange={setLessonsWithoutMark}
				/>
			</View>
			<View padding-s1 bg-$backgroundNeutralLight br50>
				{totalsAndSheduledTotals.map((e, i) => {
					const date = e.classMeetingDate ?? e.date
					return (
						<View
							key={e.assignmentId ?? i.toString()}
							flex
							row
							spread
							centerV
							padding-s2
						>
							<Mark
								duty={e.duty ?? false}
								mark={e.result ?? null}
								markWeight={
									typeof e.weight === 'number' && {
										current: e.weight,
										max: maxWeight,
										min: minWeight,
									}
								}
								style={{
									height: 50,
									width: 50,
									// ...(e.result === 'Нет' || typeof e.result === 'undefined'
									// 	? { backgroundColor: '#88888857' }
									// 	: {}),
								}}
								textStyle={{ fontSize: 17 }}
								onPress={() => {
									Alert.alert(
										(e.assignmentTypeName ?? '') +
											' ' +
											(e.result ?? 'Оценки нет'),
										`${e.weight ? `Вес: ${e.weight}` : 'Отсутствие'}${
											e.comment ? `, Комментарий: ${e.comment}` : ''
										}${
											e.date
												? `, Выставлена: ${new Date(
														e.date
												  ).toLocaleDateString()} ${new Date(e.date).toHHMM()}`
												: ''
										}`
									)
								}}
							/>
							<Text>{e.assignmentTypeName}</Text>

							<Text>{date && new Date(date).toLocaleDateString()}</Text>
						</View>
					)
				})}
			</View>
			<AddMarkForm setCustomMarks={setCustomMarks} customMarks={customMarks} />
			<View flex row spread padding-s2>
				<Text text50BO>
					Учитель:{' '}
					<Text text50>{fullname(totals.teachers[0].name, settings)}</Text>
				</Text>
			</View>
			<View flex row spread padding-s2>
				<Text text50BO>
					Прошло уроков:{' '}
					<Text text50>
						{totals.classmeetingsStats.passed}/
						{totals.classmeetingsStats.scheduled}
					</Text>
				</Text>
				<Text text50BO>
					Средний бал класса: <Text text50>{totals.classAverageMark}</Text>
				</Text>
			</View>
			<Text $textDisabled center margin-s2>
				{totalsUpdateDate}
			</Text>
		</ScrollView>
	)
}

export function caclulateMarks({
	totals,
	lessonsWithoutMark = false,
	customMarks = [],
}: {
	totals: SubjectPerformance
	lessonsWithoutMark?: boolean
	customMarks?: Partial<MarkInfo>[]
}) {
	let missedMark = (totals.attendance ?? []).map(e => {
		return {
			result: e.attendanceMark,
			assignmentId: e.classMeetingDate + e.attendanceMark,
			date: e.classMeetingDate,
		}
	})

	if (lessonsWithoutMark) {
		missedMark = missedMark.concat(
			new Array(
				totals.classmeetingsStats.passed -
					totals.results.length -
					missedMark.length
			).fill({ result: 'Нет' })
		)
	}

	let totalsAndSheduledTotals = [...missedMark, ...totals.results].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	) as Partial<MarkInfo>[]

	if (lessonsWithoutMark) {
		totalsAndSheduledTotals = totalsAndSheduledTotals.concat(
			new Array(
				totals.classmeetingsStats.scheduled - totals.classmeetingsStats.passed
			).fill({})
		)
	}

	let avgMark = totals.averageMark

	if (customMarks.length) {
		totalsAndSheduledTotals = totalsAndSheduledTotals.concat(customMarks)
		let totalWeight = 0
		let totalMark = 0

		for (const mark of [
			...totals.results,
			...(customMarks as {
				weight: number
				result: number
			}[]),
		]) {
			totalWeight += mark.weight
			totalMark += mark.weight * mark.result
		}

		avgMark = Number((totalMark / totalWeight).toFixed(2))
	}

	const weights = totals.results.map(e => e.weight)
	const maxWeight = Math.max(...weights)
	const minWeight = Math.min(...weights)
	return { avgMark, totalsAndSheduledTotals, maxWeight, minWeight }
}

function AddMarkForm(props: {
	setCustomMarks: (p: Partial<MarkInfo>[]) => void
	customMarks: Partial<MarkInfo>[]
}) {
	const [weight, setWeight] = useState('')
	const [mark, setMark] = useState('')
	const [addingCustomMark, setAddingCustomMark] = useState(false)

	const textFieldProps = {
		'br20': true,
		'margin-s2': true,
		'text70': true,
		'floatingPlaceholder': true,
		'keyboardType': 'numeric',
	} satisfies TextFieldProps

	const iconProps = {
		'marginL-s2': true,
		'iconColor': Colors.$textAccent,
		'style': buttonStyle(),
		'size': 26,
	} as Omit<IconButtonProps, 'icon'>

	return (
		<View padding-s2>
			<View flex row centerV padding-s2>
				<Button
					center
					br20
					onPress={() => {
						if (addingCustomMark) {
							// Saving
							props.setCustomMarks(
								props.customMarks.concat({
									result: Number(mark),
									weight: Number(weight),
									comment: 'Кастомная',
									assignmentTypeName: 'ВОЗМОЖНАЯ',
								})
							)
						}
						setAddingCustomMark(!addingCustomMark)
					}}
				>
					<View flex row spread centerV padding-s1>
						<Ionicon
							name={addingCustomMark ? 'save-sharp' : 'add'}
							size={18}
							color={Colors.$textAccent}
						></Ionicon>
						<Text marginL-s1 $textAccent>
							{addingCustomMark ? 'Сохранить' : 'Добавить оценку'}
						</Text>
					</View>
				</Button>
				{addingCustomMark && (
					<IconButton
						{...iconProps}
						icon="arrow-undo"
						onPress={() => {
							setAddingCustomMark(false)
						}}
					/>
				)}
				{!addingCustomMark && !!props.customMarks.length && (
					<IconButton
						{...iconProps}
						icon="trash"
						onPress={() => {
							props.setCustomMarks([])
						}}
					/>
				)}
			</View>
			{addingCustomMark && (
				<View padding-s4 backgroundColor={Colors.$backgroundPrimaryMedium} br30>
					<TextField
						{...textFieldProps}
						placeholder="Оценка"
						onChangeText={setMark}
					/>
					<TextField
						{...textFieldProps}
						placeholder="Вес"
						onChangeText={setWeight}
					/>
				</View>
			)}
		</View>
	)
}
