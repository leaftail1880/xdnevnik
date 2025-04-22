import NumberInputSetting from '@/components/NumberInput'
import { RenderHoursMinutes, SelectTime } from '@/components/SelectTime'
import UpdateDate from '@/components/UpdateDate'
import { styles } from '@/constants'
import {
	CustomSubject,
	CustomSubjectMeeting,
	Settings,
} from '@/models/settings'
import { Theme } from '@/models/theme'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { makeAutoObservable, runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { ScrollView, View } from 'react-native'
import {
	Button,
	Card,
	IconButton,
	SegmentedButtons,
	Text,
	TextInput,
} from 'react-native-paper'
import { DAY_NAMES_SHORT } from '../state'

const defaultMeeting = () =>
	({
		dayIndex: 0,
		sendNotificationBeforeMins: 15,
		startTime: { hours: 8, minutes: 0 },
		time: 10,
	}) satisfies CustomSubjectMeeting

const Meeting = observer(function Meeting(props: {
	meeting: CustomSubjectMeeting
	onSave: (meeting: CustomSubjectMeeting) => void
	onDelete: (meeting: CustomSubjectMeeting) => void
	i: number
}) {
	const [meeting, setMeeting] = useState(props.meeting)
	const saveMeeting = useCallback(
		(v: Partial<CustomSubjectMeeting>) => {
			const m = { ...meeting, ...v }
			setMeeting(m)
			props.onSave?.(m)
		},
		[meeting, props],
	)
	const [collapsed, setCollapsed] = useState(props.i !== 0)

	if (collapsed)
		return (
			<Card
				contentStyle={styles.stretch}
				style={{ paddingHorizontal: Spacings.s2 }}
				onPress={() => setCollapsed(v => !v)}
			>
				<View style={[styles.row, { gap: Spacings.s1, alignItems: 'center' }]}>
					<Text>{DAY_NAMES_SHORT[meeting.dayIndex]}</Text>
					<Text>
						<RenderHoursMinutes time={meeting.startTime} />
					</Text>
					<Text>
						<Text style={Theme.fonts.titleSmall}>
							Длительность: {meeting.time}мин
						</Text>
					</Text>
				</View>

				<IconButton
					icon="delete"
					onPress={() => props.onDelete?.(meeting)}
				></IconButton>
			</Card>
		)

	return (
		<Card
			style={{ padding: Spacings.s2 }}
			onPress={() => setCollapsed(v => !v)}
		>
			<View style={styles.stretch}>
				<Button
					onPress={() => setCollapsed(v => !v)}
					mode="contained-tonal"
					icon="minus"
				>
					Свернуть
				</Button>
				<SelectTime
					value={meeting.startTime}
					onSelect={startTime => saveMeeting({ startTime })}
					label="Время начала"
					mode="contained-tonal"
				/>
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={{ marginVertical: Spacings.s2 }}
			>
				<SegmentedButtons
					density="small"
					buttons={DAY_NAMES_SHORT.map((label, index) => ({
						label,
						value: index.toString(),
					}))}
					value={meeting.dayIndex.toString()}
					onValueChange={v => saveMeeting({ dayIndex: parseInt(v) })}
				/>
			</ScrollView>
			<NumberInputSetting
				label="Длительность"
				onChange={time => saveMeeting({ time })}
				value={meeting.time}
				description={'Продолжительность занятия в минутах'}
			/>

			<NumberInputSetting
				label="Уведомление"
				onChange={v => saveMeeting({ sendNotificationBeforeMins: v })}
				value={meeting.sendNotificationBeforeMins}
				defaultValue={15}
				description={'За сколько минут до начала занятия присылать уведомление'}
			/>
		</Card>
	)
})

const state = new (class {
	constructor() {
		makeAutoObservable(this)
	}

	editing: number | undefined = undefined
})()

export const EditDiaryAddLesson = observer(function EditDiaryAddLesson() {
	const settings = Settings.forStudentOrThrow()
	return (
		<ScrollView
			style={{ padding: Spacings.s2 }}
			contentContainerStyle={{ gap: Spacings.s3 }}
		>
			<Card
				style={{ padding: Spacings.s2 }}
				contentStyle={{ gap: Spacings.s2 }}
			>
				<Text>
					Добавляет новый тип занятия. Может быть полезно для допов или
					неофициальных уроков.
				</Text>
			</Card>
			{typeof state.editing === 'number' ? (
				<>
					<Button
						mode="contained-tonal"
						onPress={() =>
							runInAction(() => {
								state.editing = undefined
							})
						}
					>
						Назад
					</Button>
					<CustomSubjectRender
						customSubject={settings.customSubjects[state.editing]}
					/>
				</>
			) : (
				<>
					<Button
						mode="contained-tonal"
						onPress={() => {
							runInAction(() => {
								const i = settings.customSubjects.unshift({
									name: '',
									meetings: [],
								})
								state.editing = i - 1
							})
						}}
					>
						Создать новый тип
					</Button>
					{settings.customSubjects.map((e, i) => (
						<CustomSubjectDescription
							customSubject={e}
							i={i}
							key={i.toString()}
						/>
					))}
				</>
			)}
			<UpdateDate store={{ updateDate: 'Конец.' }}></UpdateDate>
		</ScrollView>
	)
})

const CustomSubjectDescription = observer(function CustomSubjectDescription({
	customSubject,
	i,
}: {
	customSubject: CustomSubject
	i: number
}) {
	return (
		<Card
			style={{ paddingHorizontal: Spacings.s2 }}
			contentStyle={styles.stretch}
			onPress={() => runInAction(() => (state.editing = i))}
		>
			<Text>
				{customSubject.name} ({customSubject.meetings.length})
			</Text>
			<IconButton
				icon="delete"
				onPress={() => {
					runInAction(() => {
						const settings = Settings.forStudentOrThrow()
						settings.customSubjects = settings.customSubjects.filter(
							e => e !== customSubject,
						)
					})
				}}
			/>
		</Card>
	)
})

const CustomSubjectRender = observer(function SubjectA({
	customSubject,
}: {
	customSubject: CustomSubject
}) {
	return (
		<>
			<Card
				style={{ padding: Spacings.s2 }}
				contentStyle={{ gap: Spacings.s2 }}
			>
				<TextInput
					mode="flat"
					label="Название"
					value={customSubject.name}
					onChangeText={t => runInAction(() => (customSubject.name = t))}
				></TextInput>
				<Text>Занятий: {customSubject.meetings.length}</Text>
				<Button
					icon={'plus'}
					mode="outlined"
					onPress={() => {
						runInAction(() => {
							customSubject.meetings.unshift(defaultMeeting())
						})
					}}
				>
					Добавить занятие
				</Button>
			</Card>
			<View style={{ gap: Spacings.s2 }}>
				{customSubject.meetings.map((meeting, i) => (
					<Meeting
						onSave={meeting => {
							runInAction(() => {
								customSubject.meetings[i] = meeting
							})
						}}
						onDelete={meeting => {
							runInAction(() => {
								customSubject.meetings = customSubject.meetings.filter(
									e => e !== meeting,
								)
							})
						}}
						meeting={meeting}
						i={i}
						key={i.toString()}
					></Meeting>
				))}
			</View>
			<Button
				icon={'content-save'}
				mode="outlined"
				onPress={() => {
					if (!customSubject.name)
						return ModalAlert.show(
							'Нет названия',
							'Заполните поле выше с названием',
							true,
						)
					if (!customSubject.meetings.length)
						return ModalAlert.show(
							'Нет занятий',
							'Добавьте хотя бы одно занятие с помощью кнопки выше',
							true,
						)

					runInAction(() => {
						state.editing = undefined
					})
				}}
			>
				Сохранить
			</Button>
		</>
	)
})
