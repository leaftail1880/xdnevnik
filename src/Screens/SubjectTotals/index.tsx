import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { Alert, ScrollView, View } from 'react-native'
import { Chip, Surface, Text } from 'react-native-paper'
import { dropdownButtonStyle } from '../../Components/Dropdown'
import { Loading } from '../../Components/Loading'
import { Mark } from '../../Components/Mark'
import { SubjectName } from '../../Components/SubjectName'
import { UpdateDate } from '../../Components/UpdateDate'
import { styles } from '../../Setup/constants'
import { SubjectPerformanceStores } from '../../Stores/NetSchool'
import { Settings } from '../../Stores/Settings'
import { Theme } from '../../Stores/Theme'
import { Spacings } from '../../utils/Spacings'
import type { MarkInfo } from '../Totals'
import type {
	S_SUBJECT_TOTALS,
	TermNavigationParamMap,
} from '../Totals/navigation'
import { AddMarkForm } from './AddMarkForm'
import { calculateMarks } from './calculateMarks'

// TODO Move custom marks to store
export const SubjectTotals = observer(function SubjectTotals({
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

	if (!marks) return <Loading text="Подсчет оценок..." />
	const { avgMark, totalsAndSheduledTotals, maxWeight, minWeight } = marks

	return (
		<View style={{ flex: 1 }}>
			<View
				style={[
					styles.stretch,
					dropdownButtonStyle(),
					{ padding: Spacings.s2 },
				]}
			>
				<SubjectName
					subjectName={performance.result.subject.name}
					subjectId={performance.result.subject.id}
					iconsSize={18}
					style={{
						fontSize: 20,
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
				<View style={{ padding: Spacings.s1 }}>
					<Chip
						mode="outlined"
						selected={!lessonsWithoutMark}
						onPress={() => {
							setLessonsWithoutMark(!lessonsWithoutMark)
						}}
					>
						Только оценки
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
				<AddMarkForm
					setCustomMarks={setCustomMarks}
					customMarks={customMarks}
				/>
				<Surface
					elevation={1}
					style={{
						padding: Spacings.s2,
						margin: Spacings.s2,
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
	mark: Partial<MarkInfo>
	maxWeight: number
	minWeight: number
}) {
	Theme.key
	const date = mark.classMeetingDate ?? mark.date
	// TODO Use placeholder if not loaded
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
					// TODO Use modal
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
