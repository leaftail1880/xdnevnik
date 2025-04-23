import NumberInputSetting from '@/components/NumberInput'
import { changeSettings, StudentSettings, XSettings } from '@/models/settings'
import { SubjectPerformance } from '@/services/net-school/entities'
import { ModalAlert } from '@/utils/Toast'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { View } from 'react-native'
import { Chip, Text } from 'react-native-paper'
import { getColorFromPercent } from './AttendanceStatsChip'

export const AttestationStatsChip = observer(function AttestationStatsChip({
	perf,
}: {
	perf: SubjectPerformance
}) {
	const settings = XSettings.forStudentOrThrow()
	const { need, attestation, marks } = getAttestation(settings, perf)

	const { colorStyle } = getColorFromPercent(~~(attestation / 30) + 2)
	const onPress = useCallback(
		() =>
			ModalAlert.show(
				'Аттестация',
				<AttestationStatsChipSettings
					subjectId={perf.subject.id}
					perf={perf}
				/>,
			),
		[perf],
	)

	return (
		<Chip compact onPress={onPress}>
			<Text style={colorStyle}>
				Аттестация {marks}/{need}
			</Text>
		</Chip>
	)
})

const AttestationStatsChipSettings = observer(
	function AttestationStatsChipSettings({
		subjectId,
		perf,
	}: {
		subjectId: number
		perf: SubjectPerformance
	}) {
		const settings = XSettings.forStudentOrThrow()
		const { need, attestation, marks } = getAttestation(settings, perf)

		return (
			<View>
				<Text>Оценок: {marks}</Text>
				<Text>Нужно: {need}</Text>
				<Text>
					Аттестация {marks}/{need} ({~~attestation}%)
				</Text>
				<NumberInputSetting
					value={settings.subjectAttestation[subjectId] ?? 0}
					onChange={v =>
						v === 0
							? runInAction(() => delete settings.subjectAttestation[subjectId])
							: changeSettings(settings, {
									subjectAttestation: { [subjectId]: v },
								})
					}
					defaultValue={0}
					label="Для этого предмета"
					description="Кол-во оценок для этого предмета. 0 чтобы использовать значение по умолчанию."
				/>
				<NumberInputSetting
					value={settings.defaultAttestation}
					onChange={v => changeSettings(settings, { defaultAttestation: v })}
					defaultValue={0}
					label="Для всех предметов"
					description="Кол-во оценок для всех предметов по умолчанию. 0 чтобы отключить проверку аттестации."
				/>
			</View>
		)
	},
)

export function getAttestation(
	settings: StudentSettings,
	perf: SubjectPerformance,
) {
	const marks = perf.results.length
	const need =
		settings.subjectAttestation[perf.subject.id] ?? settings.defaultAttestation

	const attestation = marks >= need ? 100 : (marks / need) * 100

	return { attestation, need, marks }
}
