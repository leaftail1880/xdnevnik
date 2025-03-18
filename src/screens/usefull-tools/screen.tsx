/* eslint-disable react/jsx-key */
import Header from '@/components/Header'
import Mark from '@/components/Mark'
import { RoundedSurface } from '@/components/RoundedSurface'
import { getSubjectName } from '@/components/SubjectName'
import { LANG, styles } from '@/constants'
import { Settings } from '@/models/settings'
import { SubjectPerformanceStores } from '@/services/net-school/store'
import { Spacings } from '@/utils/Spacings'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { SurfaceProps, Text } from 'react-native-paper'
import { LogoutButton } from '../login/out'
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
			<Container flex={5}>
				<AverageMarks />
			</Container>
			<View style={{ flex: 3, gap: Spacings.s2 }}>
				<Container flex={1} minHeight={100}>
					<Text>Подсчитываем оценки...</Text>
				</Container>
				<Container flex={1} minHeight={200}>
					<Text>Собираем портфель...</Text>
				</Container>
			</View>
		</View>,
		<Container flex={5} minHeight={200}>
			<Text>Готовим другие инструменты...</Text>
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
	return (
		<TermTotalsList
			ft={FlatList as unknown as typeof import('react-native').FlatList}
			style={{ maxHeight: 300 }}
			showsVerticalScrollIndicator={false}
			renderSubject={renderAverageMarkItem}
		/>
	)
})

const AverageMarkItem = observer(function AverageMarkItem(
	props: Parameters<RenderSubject>[0],
) {
	const performance = SubjectPerformanceStores.use({
		studentId: Settings.studentId,
		subjectId: props.total.subjectId,
	})

	return (
		<Container style={[styles.stretch, { gap: Spacings.s1 }]}>
			<Text style={{ flex: 1, flexWrap: 'wrap' }}>
				{getSubjectName({
					subjectId: props.total.subjectId,
					subjects: props.subjects,
				})}
			</Text>
			<Mark
				mark={performance.result?.classAverageMark}
				duty={false}
				style={{ padding: Spacings.s1 * 0.5 }}
			/>
			<Mark
				mark={props.term?.avgMark}
				duty={false}
				style={{ padding: Spacings.s1 * 0.5 }}
			/>
		</Container>
	)
})

const renderAverageMarkItem: RenderSubject = props => {
	return <AverageMarkItem {...props} />
}
