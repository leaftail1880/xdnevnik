import { observer } from 'mobx-react-lite'
import React from 'react'
import { Text } from 'react-native-paper'
import { EditDiaryAddLesson } from './AddLesson'
import { EditDiaryEditLesson } from './EditLesson'
import { EditDiaryReorderLessons } from './ReorderLessons'
import { EditDiaryScreen, EditDiaryState } from './state'

const screens: Record<EditDiaryScreen, React.FC> = {
	[EditDiaryScreen.AddLesson]: EditDiaryAddLesson,
	[EditDiaryScreen.EditLesson]: EditDiaryEditLesson,
	[EditDiaryScreen.ReorderLessons]: EditDiaryReorderLessons,
}

export const EditDiaryDayScreen = observer(function EditDiaryDayScreen() {
	if (typeof EditDiaryState.currentScreen === 'undefined')
		return <Text>No screen!</Text>

	const Screen = screens[EditDiaryState.currentScreen]
	return <Screen />
})
