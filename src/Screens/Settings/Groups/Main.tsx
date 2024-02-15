import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { View } from 'react-native-ui-lib'
import { Loading } from '../../../Components/Loading'
import { API } from '../../../NetSchool/api'
import { StudentsStore } from '../../../Stores/API.stores'
import { Settings, fullname } from '../../../Stores/Settings.store'
import { DropdownSettingsButton } from '../Components/DropdownSettingsButton'
import { SettingsJumpNavigation } from '../Components/Navigate'
import { SettingsRoutes } from '../SettingsNavigation'

export const MainSettings = observer(function MainSettings(
	props: StackScreenProps<SettingsRoutes>
) {
	const students = StudentsStore
	return (
		<ScrollView
			contentContainerStyle={{
				flex: 1,
				alignContent: 'flex-start',
				justifyContent: 'flex-start',
			}}
		>
			<View margin-s1></View>
			{API.session ? (
				students.fallback || (
					<DropdownSettingsButton
						data={students.result.map((student, i) => ({
							i,
							name: fullname(student.name),
						}))}
						onSelect={s => Settings.save({ studentIndex: s.i })}
						selectionText={i => i?.name}
						defaultValueByIndex={Settings.studentIndex}
						label={false}
						buttonViewStyle={{ alignItems: 'center', justifyContent: 'center' }}
					/>
				)
			) : (
				<Loading text="Ожидание авторизации{dots}"></Loading>
			)}
			<SettingsJumpNavigation navigation={props} target={'notifs'} />
			<SettingsJumpNavigation navigation={props} target={'colors'} />
			<SettingsJumpNavigation navigation={props} target={'update'} />
			<SettingsJumpNavigation navigation={props} target={'about'} />
		</ScrollView>
	)
})
