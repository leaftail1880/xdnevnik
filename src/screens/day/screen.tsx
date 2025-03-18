import Header from '@/components/Header'
import SelectModal from '@/components/SelectModal'
import UpdateDate from '@/components/UpdateDate'
import { Settings } from '@/models/settings'
import { Theme } from '@/models/theme'
import { Lesson } from '@/services/net-school/lesson'
import { DiaryStore } from '@/services/net-school/store'
import { StackScreenProps } from '@react-navigation/stack'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { View } from 'react-native'
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars'
import { Positions } from 'react-native-calendars/src/expandableCalendar'
import { ScrollView } from 'react-native-gesture-handler'
import { Chip, FAB } from 'react-native-paper'
import { ParamListBase } from '../../../App'
import { Spacings } from '../../utils/Spacings'
import Day, { DiaryEditDay } from './Day'
import { DiaryState } from './state'

// @ts-expect-error fix for defaultProps warning: https://github.com/wix/react-native-calendars/issues/2455
ExpandableCalendar.defaultProps = undefined

import { Chips } from '@/components/Chips'
import { LocaleConfig } from 'react-native-calendars'

// localization for react-native-calendars
// https://github.com/arshaw/xdate/blob/3060bceb5f0901f48df9ae657b6349b2733fec37/src/xdate.js#L475
LocaleConfig.locales['ru-RU'] = {
	monthNames: [
		'Январь',
		'Февраль',
		'Март',
		'Апрель',
		'Май',
		'Июнь',
		'Июль',
		'Август',
		'Сентябрь',
		'Октябрь',
		'Ноябрь',
		'Декабрь',
	],
	monthNamesShort: [
		'Янв',
		'Фев',
		'Мар',
		'Апр',
		'Май',
		'Июн',
		'Июл',
		'Авг',
		'Сен',
		'Окт',
		'Ноя',
		'Дек',
	],
	dayNames: [
		'воскресенье',
		'понедельник',
		'вторник',
		'среда',
		'четверг',
		'пятница',
		'суббота',
	],
	dayNamesShort: [
		//
		'вс',
		'пн',
		'вт',
		'ср',
		'чт',
		'пт',
		'сб',
	],
	today: 'Сегодня',
}
LocaleConfig.defaultLocale = 'ru-RU'

export default observer(function DiaryScreen(props: DiaryLessonNavigation) {
	return (
		<View style={{ flex: 1 }}>
			<Header title="Дневник"></Header>
			<FAB
				onPress={() => runInAction(() => (DiaryState.edit = !DiaryState.edit))}
				label=""
				icon={DiaryState.edit ? 'content-save' : 'pencil'}
				style={{
					position: 'absolute',
					margin: 16,
					right: 0,
					bottom: 10,
					zIndex: 100,
				}}
			/>
			{!DiaryState.edit ? (
				<ScrollView
					contentContainerStyle={{
						justifyContent: 'center',
						alignContent: 'center',
					}}
					refreshControl={DiaryStore.refreshControl}
				>
					<View style={{ flex: 1, zIndex: 30 }}>
						<SelectDay />
					</View>
					<Chips>
						<Filter type="showHomework" label="Оценки" />
						<Filter type="showAttachments" label="Файлы" />
						<Filter type="showLessonTheme" label="Темы" />
					</Chips>
					<View style={{ padding: Spacings.s1 }}>
						{DiaryStore.fallback || <Day {...props} />}
					</View>
					<UpdateDate store={DiaryStore} />
				</ScrollView>
			) : (
				<View
					style={{
						paddingHorizontal: Spacings.s1,
						marginBottom: 100,
						padding: Spacings.s3,
					}}
				>
					{DiaryStore.fallback || (
						<DiaryEditDay lessons={DiaryStore.result.lessons} />
					)}
				</View>
			)}
		</View>
	)
})

function toCalendar(yyyymmdd: string) {
	return yyyymmdd.split('.').reverse().join('-')
}

function fromCalendar(calendar: string) {
	return calendar.split('-').reverse().join('.')
}

const SelectDay = observer(function SelectDay() {
	if (Settings.newDatePicker) {
		const theme: import('react-native-calendars').CalendarProps['theme'] = {
			backgroundColor: Theme.colors.navigationBar,
			calendarBackground: Theme.colors.navigationBar,

			textSectionTitleColor: Theme.colors.primary,
			monthTextColor: Theme.colors.primary,
			arrowColor: Theme.colors.primary,

			selectedDayBackgroundColor: Theme.colors.secondaryContainer,
			selectedDayTextColor: Theme.colors.onPrimaryContainer,

			todayBackgroundColor: Theme.colors.elevation.level4,
			todayTextColor: Theme.colors.onSecondaryContainer,

			textDisabledColor: Theme.colors.onSurfaceDisabled,
			dayTextColor: Theme.colors.onBackground,
		}
		return (
			<CalendarProvider
				date={toCalendar(DiaryState.day)}
				onDateChanged={d => {
					setTimeout(() => {
						d = fromCalendar(d)
						runInAction(() => {
							DiaryState.day = d

							const [day, month, year] = d.split('.').map(e => parseInt(e))
							const weekDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`)
							DiaryState.week = weekDate
						})
					}, 100)
				}}
			>
				<ExpandableCalendar
					theme={theme}
					key={Theme.key + Object.values(theme).join(',')}
					firstDay={1}
					openThreshold={0}
					closeThreshold={0}
					horizontal
					initialPosition={Positions.CLOSED}
					allowShadow
					closeOnDayPress={false}
				></ExpandableCalendar>
			</CalendarProvider>
		)
	}

	return (
		<SelectModal
			label="День"
			mode="button"
			data={DiaryState.weekDaysDropdown}
			value={DiaryState.day}
			onSelect={item =>
				runInAction(() => {
					if ('week' in item) DiaryState.week = item.week
					DiaryState.day = item.value.replace('$TODAY', '')
				})
			}
		/>
	)
})

type FilterProps = {
	type: keyof FilterObject<typeof DiaryState, boolean>
	label: string
}

const Filter = observer(function Filter(props: FilterProps) {
	const onPress = useCallback(
		() =>
			runInAction(() => {
				DiaryState[props.type] = !DiaryState[props.type]
			}),
		[props.type],
	)

	return (
		<Chip mode="flat" selected={DiaryState[props.type]} onPress={onPress}>
			{props.label}
		</Chip>
	)
})

export type DiaryLessonProps = {
	i: number
	lesson: Lesson
	navigateToLessonMarks: VoidFunction
}

export type DiaryLessonNavigation = StackScreenProps<ParamListBase>
