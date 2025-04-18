import { MarkColorsText, MarkColorsBG } from '@/components/Mark'
import { Theme } from '@/models/theme'
import {
	SubjectPerformance,
	ClassMeetingStats,
} from '@/services/net-school/entities'
import { ModalAlert } from '@/utils/Toast'
import { observer } from 'mobx-react-lite'
import { View, Text } from 'react-native'
import { Chip } from 'react-native-paper'

export function getAttendance(
	perf: SubjectPerformance,
	meetings: ClassMeetingStats,
) {
	const visited = meetings.passed - perf.attendance.length

	return {
		visited,
		attendance: percent(visited, meetings.passed),
		total: percent(visited, meetings.scheduled),
	}
}

function percent(value: number, from: number) {
	return value === 0 ? 100 : ~~((value / from) * 100)
}

export const AttendanceStatsChip = observer(function AttendanceStatsChip({
	perf,
	meetings,
}: {
	perf: SubjectPerformance
	meetings: ClassMeetingStats
}) {
	const { attendance, total, visited } = getAttendance(perf, meetings)
	const color = getColor(~~(attendance / 30) + 2)

	return (
		<Chip
			compact
			onPress={() =>
				ModalAlert.show(
					'Посещаемость',
					<View>
						<Text>Посещений: {visited}</Text>
						<Text>
							Пропущено: {perf.attendance.length} (
							<Text style={{ color }}>{attendance}%</Text>)
						</Text>
						<Text>Уроков осталось: {meetings.scheduled - meetings.passed}</Text>
						<Text>Уроков прошло: {meetings.passed}</Text>
						<Text>Уроков всего: {meetings.scheduled}</Text>
						<Text>Итоговая посещаемость: {total}%</Text>
					</View>,
				)
			}
		>
			<Text style={{ color }}>Посещаемость {attendance}%</Text>
		</Chip>
	)
})

export function getColor(id: number) {
	const colorSource = Theme.dark ? MarkColorsText : MarkColorsBG
	return id in colorSource
		? colorSource[id as keyof typeof MarkColorsText]
		: colorSource[2]
}
