import {
	getOverridenOrOfficalName,
	getSubjectName,
} from '@/components/SubjectName'
import UpdateDate from '@/components/UpdateDate'
import { XSettings } from '@/models/settings'
import { Lesson } from '@/services/net-school/lesson'
import { DiaryStore } from '@/services/net-school/store'
import { Spacings } from '@/utils/Spacings'
import { ModalAlert } from '@/utils/Toast'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import {
	FlatList,
	ListRenderItem,
	ListRenderItemInfo,
	View,
} from 'react-native'
import { Button, Text } from 'react-native-paper'
import { EditSingleLesson } from './EditSingleLesson'
import { DiaryLessonShort } from './ReorderLessons'

export const EditDiaryEditLesson = observer(function EditDiaryEditLesson() {
	return <Screen />
})

const Screen = observer(function Screen() {
	const lessons = DiaryStore.result!.lessons
	return (
		<FlatList
			data={lessons}
			renderItem={renderItem}
			ListHeaderComponent={
				<View style={{ padding: Spacings.s2 }}>
					<Text>
						Нажмите на предмет, чтобы переименовать или изменить его время для
						конкретного дня. Измененные предметы выделенны цветом.
					</Text>
					<Button
						onPress={() => {
							runInAction(() => {
								const settings = XSettings.forStudentOrThrow()
								settings.subjectNamesDay = {}
								settings.lessonOrder = {}
							})
						}}
					>
						Сбросить
					</Button>
				</View>
			}
			ListFooterComponent={
				<UpdateDate store={{ updateDate: 'Конец.' }}></UpdateDate>
			}
		/>
	)
})

const renderItem: ListRenderItem<Lesson> = args => <DiaryLessonItem {...args} />

const DiaryLessonItem = observer(function DiaryLessonItem(
	props: ListRenderItemInfo<Lesson>,
) {
	const onPress = useCallback(() => {
		ModalAlert.show('Редактировать', <EditSingleLesson lesson={props.item} />)
	}, [props.item])
	const settings = XSettings.forStudentOrThrow()
	return (
		<DiaryLessonShort
			isEdited={
				getSubjectName(props.item) !==
				getOverridenOrOfficalName(props.item, settings)
			}
			lesson={props.item}
			onPress={onPress}
		/>
	)
})
