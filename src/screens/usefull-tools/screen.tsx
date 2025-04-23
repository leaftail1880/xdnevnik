/* eslint-disable react/jsx-key */
import Header from '@/components/Header'
import Mark, { MarkColorsBG } from '@/components/Mark'
import { RoundedSurface } from '@/components/RoundedSurface'
import { getSubjectName } from '@/components/SubjectName'
import { LANG, globalStyles } from '@/constants'
import { XSettings } from '@/models/settings'
import { SubjectPerformanceStores } from '@/services/net-school/store'
import { Spacings } from '@/utils/Spacings'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { SurfaceProps, Text } from 'react-native-paper'
import { LogoutButton } from '../login/out'
import { createSubjectAndTotalsStoreParamsAutorun } from '../totals/screen'
import { SubjectTotalsImpl } from '../totals/subject/screen'
import { RenderSubject, TermTotalsList } from '../totals/term/screen'

const Container = observer(function Container(
	props: SurfaceProps & { flex?: number; minHeight?: number },
) {
	return (
		<RoundedSurface
			{...props}
			style={[
				{ marginHorizontal: 0 },
				props.flex ? { flex: props.flex } : undefined,
				props.minHeight ? { minHeight: props.minHeight } : undefined,
				props.style,
			]}
		/>
	)
})

export default observer(function UsefullToolsScreen() {
	const data = [
		<View style={{ flexDirection: 'row', flex: 5, gap: Spacings.s2 }}>
			<Container flex={6}>
				<AverageMarks />
			</Container>
			<View style={{ flex: 3, gap: Spacings.s2 }}>
				<Container flex={1} minHeight={100}>
					<Text>Собираем портфель...</Text>
				</Container>
				<Container flex={1} minHeight={200}>
					<Text>Готовим другие инструменты...</Text>
				</Container>
			</View>
		</View>,
		<Container flex={5}>
			<SubjectTotalsImpl
				finalMark={null}
				performance={{
					result: {
						attendance: [],
						averageMark: 0,
						classAverageMark: 0,
						classmeetingsStats: { passed: 0, scheduled: 99999 },
						markStats: [],
						maxMark: 0,
						results: [],
						subject: { id: 0, name: 'Калькулятор оценок' },
						teachers: [],
						term: { id: 0, name: '' },
					},
					fallback: undefined,
					refreshControl: <></>,
					updateDate: '',
					reload: () => void 0,
				}}
				navigateToDiary={() => void 0}
			/>
		</Container>,
		<LogoutButton />,
		<View style={{ minHeight: 30 }}></View>,
	]
	return (
		<View style={{ flex: 1 }}>
			<Header title={LANG['s_usefull_tools']}></Header>
			<FlatList<React.ReactElement>
				contentContainerStyle={{
					justifyContent: 'center',
					alignContent: 'center',
					padding: Spacings.s2,
					gap: Spacings.s2,
				}}
				data={data}
				renderItem={e => e.item}
			></FlatList>
		</View>
	)
})

const AverageMarks = observer(function AverageMarks() {
	createSubjectAndTotalsStoreParamsAutorun()

	return (
		<TermTotalsList
			ft={FlatList as unknown as typeof import('react-native').FlatList}
			style={{ maxHeight: 300 }}
			ListHeaderComponent={
				<Text style={{ fontWeight: 'bold' }}>
					Средняя оценка ученика/средняя оценка класса
				</Text>
			}
			showsVerticalScrollIndicator={false}
			renderSubject={renderAverageMarkItem}
		/>
	)
})

const AverageMarkItem = observer(function AverageMarkItem(
	props: Parameters<RenderSubject>[0],
) {
	const performance = SubjectPerformanceStores.use({
		studentId: XSettings.studentId,
		subjectId: props.total.subjectId,
	})

	const avgMark = props.term?.avgMark ?? 0
	const classAverageMark = performance.result?.classAverageMark ?? 0
	const level = classAverageMark === 0 ? 0 : (avgMark / classAverageMark) * 1000
	const up = level >= 1000
	return (
		<View
			style={[
				globalStyles.stretch,
				{ gap: Spacings.s1, marginTop: Spacings.s1 },
			]}
		>
			<Text style={{ flex: 5, flexWrap: 'wrap' }}>
				{getSubjectName({
					subjectId: props.total.subjectId,
					subjects: props.subjects,
				})}
			</Text>
			<Text
				style={{
					flex: 2,
					textAlign: 'right',
					fontSize: 12,
					color: up ? MarkColorsBG[5] : MarkColorsBG[2],
				}}
			>
				{(up ? '+' : '') + (level - 1000).toFixed(0) + '%'}
			</Text>
			<Mark
				mark={avgMark}
				duty={false}
				style={{ padding: Spacings.s1 * 0.5, flex: 2 }}
			/>
			<Mark
				mark={classAverageMark}
				duty={false}
				style={{ padding: Spacings.s1 * 0.5, flex: 2 }}
			/>
		</View>
	)
})

const renderAverageMarkItem: RenderSubject = props => {
	return <AverageMarkItem {...props} />
}
