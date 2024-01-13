import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { Alert, ScrollView } from 'react-native'
import { Colors, Switch, Text, View } from 'react-native-ui-lib'
import { dropdownStyle } from '../../Components/Dropdown'
import { Loading } from '../../Components/Loading'
import { Mark } from '../../Components/Mark'
import { SubjectName } from '../../Components/SubjectName'
import { fullname } from '../../Stores/Settings.store'
import { XDnevnik } from '../../Stores/Xdnevnik.store'
import type { MarkInfo } from '../Totals'
import { SubjectPerformanceStores } from '../Totals/SubjectMarksInline'
import type { ParamMap, S_SUBJECT_TOTALS } from '../Totals/navigation'
import { AddMarkForm } from './AddMarkForm'
import { calculateMarks } from './calculateMarks'

// TODO Move custom marks to store
export const SubjectTotals = observer(function SubjectTotals({
	route,
}: StackScreenProps<ParamMap, typeof S_SUBJECT_TOTALS>) {
	const { termId, subjectId, finalMark } = route.params ?? {}
	const studentId = XDnevnik.studentId
	const performance = SubjectPerformanceStores.use({
		studentId,
		subjectId,
	})
	performance.withParams({
		termId,
	})

	const [lessonsWithoutMark, setLessonsWithoutMark] = useState(false)
	const [customMarks, setCustomMarks] = useState<Partial<MarkInfo>[]>([])
	const marks = useMemo(
		() =>
			!!performance.result &&
			calculateMarks({
				totals: performance.result,
				lessonsWithoutMark,
				customMarks,
			}),
		[customMarks, lessonsWithoutMark, performance.result]
	)

	if (performance.fallback) return performance.fallback

	if (!marks) return <Loading text="Подсчет оценок{dots}" />
	const { avgMark, totalsAndSheduledTotals, maxWeight, minWeight } = marks

	return (
		<View>
			<View
				row
				spread
				padding-s2
				centerV
				style={[dropdownStyle(), { elevation: 0 }]}
			>
				<SubjectName
					subjectName={performance.result.subject.name}
					subjectId={performance.result.subject.id}
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
			<ScrollView refreshControl={performance.refreshControl}>
				<View flex row center padding-s3>
					<Text marginR-s2>Уроки без оценок</Text>
					<Switch
						value={lessonsWithoutMark}
						onValueChange={setLessonsWithoutMark}
					/>
				</View>
				<View padding-s1 bg-$backgroundNeutralLight br50>
					{totalsAndSheduledTotals.map((e, i) => (
						<MarkRow
							mark={e}
							maxWeight={maxWeight}
							minWeight={minWeight}
							key={e.assignmentId ?? i.toString()}
						/>
					))}
				</View>
				<AddMarkForm
					setCustomMarks={setCustomMarks}
					customMarks={customMarks}
				/>
				<View padding-s2>
					<Text>
						Учитель:{' '}
						<Text text50>{fullname(performance.result.teachers[0].name)}</Text>
					</Text>
					<Text>
						Прошло уроков:{' '}
						<Text text50>
							{performance.result.classmeetingsStats.passed}/
							{performance.result.classmeetingsStats.scheduled}
						</Text>
					</Text>
					<Text>
						Средний бал класса:{' '}
						<Text text50>{performance.result.classAverageMark}</Text>
					</Text>
				</View>
				<Text $textDisabled center margin-s2>
					{performance.updateDate}
				</Text>
				<View margin-s10>
					<Text>-</Text>
				</View>
			</ScrollView>
		</View>
	)
})

const MarkRow = observer(function MarkRow({
	mark,
	maxWeight,
	minWeight,
}: {
	mark: Partial<MarkInfo>
	maxWeight: number
	minWeight: number
}) {
	const date = mark.classMeetingDate ?? mark.date
	return (
		<View flex row spread centerV padding-s2>
			<Mark
				duty={mark.duty ?? false}
				mark={mark.result ?? null}
				markWeight={
					typeof mark.weight === 'number' && {
						current: mark.weight,
						max: maxWeight,
						min: minWeight,
					}
				}
				style={{
					height: 50,
					width: 50,
				}}
				textStyle={{ fontSize: 17 }}
				onPress={() => {
					Alert.alert(
						(mark.assignmentTypeName ?? '') +
							' ' +
							(mark.result ?? 'Оценки нет'),
						`${mark.weight ? `Вес: ${mark.weight}` : 'Отсутствие'}${
							mark.comment ? `, Комментарий: ${mark.comment}` : ''
						}${
							mark.date
								? `, Выставлена: ${new Date(
										mark.date
								  ).toLocaleDateString()} ${new Date(mark.date).toHHMM()}`
								: ''
						}`
					)
				}}
			/>
			<Text>{mark.assignmentTypeName}</Text>

			<Text>{date && new Date(date).toLocaleDateString()}</Text>
		</View>
	)
})
