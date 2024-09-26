import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Chip, Surface, Text } from 'react-native-paper'
import Mark from '~components/Mark'
import SubjectName from '~components/SubjectName'
import UpdateDate from '~components/UpdateDate'
import { Settings } from '~models/settings'
import { Theme } from '~models/theme'
import type { PartialAssignment } from '~services/net-school/entities'
import { SubjectPerformanceStores } from '~services/net-school/store'
import { styles } from '../../../constants'
import { Spacings } from '../../../utils/Spacings'
import { ModalAlert } from '../../../utils/Toast'
import { calculateMarks } from '../../../utils/calculateMarks'
import type { S_SUBJECT_TOTALS, TermNavigationParamMap } from '../navigation'
import { AddMarkForm } from './AddMarkForm'

export default observer(function SubjectTotals({
	route,
}: StackScreenProps<TermNavigationParamMap, typeof S_SUBJECT_TOTALS>) {
	const { termId, subjectId, finalMark } = route.params ?? {}
	const { studentId } = Settings
	const performance = SubjectPerformanceStores.use({
		studentId,
		subjectId,
	})
	performance.withParams({
		termId,
	})

	const [lessonsWithoutMark, setLessonsWithoutMark] = useState(false)
	const [attendance, setAttendance] = useState(false)
	const [customMarks, setCustomMarks] = useState<Partial<PartialAssignment>[]>(
		[],
	)
	const marks = useMemo(
		() =>
			!!performance.result &&
			calculateMarks({
				totals: performance.result,
				lessonsWithoutMark,
				customMarks,
				attendance: attendance,
			}),
		[attendance, customMarks, lessonsWithoutMark, performance.result],
	)

	if (performance.fallback) return performance.fallback

	if (!marks) return <Text>Ошибка при подсчете оценок</Text>
	const { avgMark, totalsAndSheduledTotals, maxWeight, minWeight } = marks

	return (
		<View style={{ flex: 1 }}>
			<View
				style={[
					styles.stretch,
					{
						padding: Spacings.s2,
						alignSelf: 'center',
						width: '100%',
						backgroundColor: Theme.colors.navigationBar,
						borderBottomLeftRadius: Theme.roundness,
						borderBottomRightRadius: Theme.roundness,
						elevation: 2,
					},
				]}
			>
				<SubjectName
					subjectName={performance.result.subject.name}
					subjectId={performance.result.subject.id}
					style={{
						fontSize: 18,
						fontWeight: 'bold',
						margin: Spacings.s1,
					}}
				/>
				<Mark
					duty={false}
					finalMark={finalMark}
					mark={avgMark}
					style={{ padding: Spacings.s2 }}
					textStyle={{ fontSize: 20 }}
				/>
			</View>
			<ScrollView refreshControl={performance.refreshControl}>
				<View style={{ padding: Spacings.s2, flex: 1, flexDirection: 'row' }}>
					<Chip
						mode="flat"
						selected={attendance}
						onPress={() => {
							setAttendance(!attendance)
						}}
					>
						Посещаемость
					</Chip>
					<Chip
						style={{ marginLeft: Spacings.s2 }}
						mode="flat"
						selected={lessonsWithoutMark}
						onPress={() => {
							setLessonsWithoutMark(!lessonsWithoutMark)
						}}
					>
						Уроки без оценок
					</Chip>
				</View>
				<Surface elevation={1}>
					{totalsAndSheduledTotals.map((e, i) => (
						<MarkRow
							mark={e}
							maxWeight={maxWeight}
							minWeight={minWeight}
							key={e.assignmentId ?? i.toString()}
						/>
					))}
				</Surface>
				<Surface
					elevation={1}
					style={{
						padding: Spacings.s1,
						margin: Spacings.s2,
						borderRadius: Theme.roundness * 2,
					}}
				>
					<AddMarkForm
						setCustomMarks={setCustomMarks}
						customMarks={customMarks}
					/>
				</Surface>
				<Surface
					elevation={1}
					style={{
						padding: Spacings.s2,
						marginHorizontal: Spacings.s2,
						borderRadius: Theme.roundness * 2,
					}}
				>
					<Text>
						Учитель:{' '}
						<Text variant="labelLarge">
							{performance.result.teachers
								.map(e => Settings.fullname(e.name))
								.join(', ')}
						</Text>
					</Text>
					<Text>
						Прошло уроков:{' '}
						<Text variant="labelLarge">
							{performance.result.classmeetingsStats.passed}/
							{performance.result.classmeetingsStats.scheduled}
						</Text>
						, осталось:{' '}
						<Text variant="labelLarge">
							{performance.result.classmeetingsStats.scheduled -
								performance.result.classmeetingsStats.passed}
						</Text>
					</Text>
					<Text>
						Суммарный вес всех оценок:{' '}
						<Text variant="labelLarge">
							{performance.result.results.reduce((p, c) => p + c.weight, 0)}
						</Text>
					</Text>
					<View
						style={{
							flexDirection: 'row',
							flex: 1,
							alignItems: 'center',
						}}
					>
						<Text>Средний балл класса: </Text>
						<Mark
							mark={performance.result.classAverageMark}
							duty={false}
							style={{ padding: Spacings.s1 }}
						/>
					</View>
				</Surface>
				<UpdateDate store={performance} />
			</ScrollView>
		</View>
	)
})

const MarkRow = observer(function MarkRow({
	mark,
	maxWeight,
	minWeight,
}: {
	mark: Partial<PartialAssignment>
	maxWeight: number
	minWeight: number
}) {
	Theme.key
	const date = mark.classMeetingDate ?? mark.date
	return (
		<View style={[styles.stretch, { padding: Spacings.s2 }]}>
			<Mark
				duty={mark.duty ?? false}
				mark={mark.result ?? null}
				weight={mark.weight}
				minWeight={minWeight}
				maxWeight={maxWeight}
				style={{ paddingHorizontal: Spacings.s3, paddingVertical: 2 }}
				textStyle={{ fontSize: 17 }}
				onPress={() => {
					ModalAlert.show(
						(mark.assignmentTypeName ?? '') +
							' ' +
							(mark.result ?? 'Оценки нет'),
						`${mark.weight ? `Вес: ${mark.weight}` : 'Отсутствие'}${
							mark.comment ? `, Комментарий: ${mark.comment}` : ''
						}${
							mark.date
								? `, Выставлена: ${new Date(
										mark.date,
									).toLocaleDateString()} ${new Date(mark.date).toHHMM()}`
								: ''
						}`,
					)
				}}
			/>
			<Text style={{ maxWidth: '70%' }}>{mark.assignmentTypeName}</Text>

			<Text>{date && new Date(date).toLocaleDateString()}</Text>
		</View>
	)
})
