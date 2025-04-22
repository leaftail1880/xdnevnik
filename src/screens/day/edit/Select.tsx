import { ModalAlert } from '@/utils/Toast'
import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { View } from 'react-native'
import { Button, FAB } from 'react-native-paper'
import { DiaryState } from '../state'
import { EditDiaryScreen, EditDiaryState } from './state'

function jumpTo(target: EditDiaryScreen) {
	return function jumpTo() {
		runInAction(() => {
			EditDiaryState.currentScreen = target
			DiaryState.edit = true
			ModalAlert.close()
		})
	}
}

const addLesson = jumpTo(EditDiaryScreen.AddLesson)
const reorderLessons = jumpTo(EditDiaryScreen.ReorderLessons)
const editLesson = jumpTo(EditDiaryScreen.EditLesson)

export const EditDiarySelect = observer(function EditDiarySelect() {
	return (
		<View>
			<Button onPress={addLesson}>Добавить урок</Button>
			<Button onPress={editLesson}>Изменить урок</Button>
			<Button onPress={reorderLessons}>Изменить порядок уроков</Button>
		</View>
	)
})

export const EditDiaryFAB = observer(function EditDiaryFAB() {
	return (
		<FAB
			onPress={() =>
				runInAction(() => {
					if (!DiaryState.edit) {
						ModalAlert.show('Изменить', <EditDiarySelect />)
					} else {
						DiaryState.edit = false
					}
				})
			}
			label=""
			icon={DiaryState.edit ? 'check' : 'pencil'}
			style={{
				position: 'absolute',
				margin: 16,
				right: 0,
				bottom: 10,
				zIndex: 100,
			}}
		/>
	)
})
