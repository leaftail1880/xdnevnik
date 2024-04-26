import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { Chip, Surface, Text } from 'react-native-paper'
import Mark from '../../../components/Mark'
import SubjectName from '../../../components/SubjectName'
import UpdateDate from '../../../components/UpdateDate'
import { styles } from '../../../constants'
import { Settings } from '../../../models/settings'
import { Theme } from '../../../models/theme'
import type { PartialAssignment } from '../../../services/NetSchool/entities'
import { SubjectPerformanceStores } from '../../../services/NetSchool/store'
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
					iconsSize={18}
					style={{
						fontSize: 20,
						maxWidth: '70%',
						fontWeight: 'bold',
						margin: Spacings.s1,
					}}
				/>
				<Mark
					duty={false}
					finalMark={finalMark}
					mark={avgMark}
					style={{ height: 60, width: 60 }}
					textStyle={{ fontSize: 22 }}
				/>
			</View>
			<ScrollView refreshControl={performance.refreshControl}>
				<View style={{ padding: Spacings.s2, flex: 1, flexDirection: 'row' }}>
					<Chip
						mode="outlined"
						selected={attendance}
						onPress={() => {
							setAttendance(!attendance)
						}}
					>
						Посещаемость
					</Chip>
					<Chip
						style={{ marginLeft: Spacings.s2 }}
						mode="outlined"
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
							{Settings.fullname(performance.result.teachers[0].name)}
						</Text>
					</Text>
					<Text>
						Прошло уроков:{' '}
						<Text variant="labelLarge">
							{performance.result.classmeetingsStats.passed}/
							{performance.result.classmeetingsStats.scheduled}
						</Text>
					</Text>
					<Text>
						Средний бал класса:{' '}
						<Text variant="labelLarge">
							{performance.result.classAverageMark}
						</Text>
					</Text>
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
