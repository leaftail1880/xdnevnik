import { MarkColorsBG, MarkColorsText } from '@/components/Mark'
import { Theme } from '@/models/theme'
import {
	ClassMeetingStats,
	SubjectPerformance,
} from '@/services/net-school/entities'
import { ModalAlert } from '@/utils/Toast'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { StyleProp, TextStyle, View } from 'react-native'
import { Chip, Text } from 'react-native-paper'

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
	const { colorStyle } = getColorFromPercent(~~(attendance / 30) + 2)
	const onPress = useCallback(
		() =>
			ModalAlert.show(
				'Посещаемость',
				<View>
					<Text>Посещений: {visited}</Text>
					<Text>
						Пропущено: {perf.attendance.length} (
						<Text style={colorStyle}>{attendance}%</Text>)
					</Text>
					<Text>Уроков осталось: {meetings.scheduled - meetings.passed}</Text>
					<Text>Уроков прошло: {meetings.passed}</Text>
					<Text>Уроков всего: {meetings.scheduled}</Text>
					<Text>Итоговая посещаемость: {total}%</Text>
				</View>,
			),
		[perf, meetings, total, colorStyle, attendance, visited],
	)

	return (
		<Chip compact onPress={onPress}>
			<Text style={colorStyle}>Посещаемость {attendance}%</Text>
		</Chip>
	)
})

function getColorPercentStyles(
	colorSource: typeof MarkColorsText,
): Record<keyof typeof MarkColorsText, StyleProp<TextStyle>> {
	return {
		2: { color: colorSource[2] },
		3: { color: colorSource[3] },
		4: { color: colorSource[4] },
		5: { color: colorSource[5] },
	}
}

const darkColorPercentStyles = getColorPercentStyles(MarkColorsText)
const lightColorPercentStyles = getColorPercentStyles(MarkColorsBG)

export function getColorFromPercent(id: number) {
	const colorSource = Theme.dark ? MarkColorsText : MarkColorsBG
	const colorStyleSource = Theme.dark
		? darkColorPercentStyles
		: lightColorPercentStyles

	return id in colorSource
		? {
				color: colorSource[id as keyof typeof MarkColorsText],
				colorStyle: colorStyleSource[id as keyof typeof MarkColorsText],
			}
		: { color: colorSource[2], colorStyle: colorStyleSource[2] }
}
