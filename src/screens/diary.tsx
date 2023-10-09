import { Picker } from '@react-native-picker/picker'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import Diary from '../NetSchool/diary'
import { Async } from '../components/async'
import { LANG, STYLES } from '../constants'

export const DiaryScreen = ({ diary }: { diary: Diary }) => {
	const [diaryDay, setDiaryDay] = useState(new Date().toYYYYMMDD())

	return (
		<ScrollView
			contentContainerStyle={{
				justifyContent: 'center',
				alignContent: 'center',
			}}
		>
			<Picker
				style={{ alignSelf: 'stretch' }}
				selectedValue={diaryDay}
				onValueChange={setDiaryDay}
			>
				<Picker.Item label={LANG['monday']} value={Date.week[0]} />
				<Picker.Item label={LANG['tuesday']} value={Date.week[1]} />
				<Picker.Item label={LANG['wednesday']} value={Date.week[2]} />
				<Picker.Item label={LANG['thursday']} value={Date.week[3]} />
				<Picker.Item label={LANG['friday']} value={Date.week[4]} />
				<Picker.Item label={LANG['saturday']} value={Date.week[5]} />
				<Picker.Item label={LANG['sunday']} value={Date.week[6]} />
			</Picker>
			<Async<Diary>
				loading="Загрузка дневника{dots}"
				then={() =>
					diary.forDay(diaryDay).map(lesson => (
						<View>
							<Text style={{ fontWeight: 'bold', ...STYLES.buttonText }}>
								{`${lesson.start.toHHMM()} - ${lesson.end.toHHMM()} ${
									lesson.subjectName
								}\n`}
							</Text>
							<Text style={STYLES.buttonText}>
								{(lesson.roomName ?? 'Кабинет не указан') + '\n'}
							</Text>
							{lesson.lessonTheme && (
								<Text style={STYLES.buttonText}>
									{lesson.lessonTheme + '\n'}
								</Text>
							)}
						</View>
					))
				}
			></Async>
		</ScrollView>
	)
}
