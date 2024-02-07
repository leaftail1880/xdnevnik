import { StackScreenProps } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { ScrollView } from 'react-native'
import { View } from 'react-native-ui-lib'
import { Loading } from '../../../Components/Loading'
import { API } from '../../../NetSchool/api'
import { StudentsStore } from '../../../Stores/API.stores'
import { Settings, fullname } from '../../../Stores/Settings.store'
import { Theme } from '../../../Stores/Theme.store'
import { SettingsText } from '../Components/Base'
import { DropdownSettingsButton } from '../Components/DropdownSettingsButton'
import { SettingsButton } from '../Components/SettingsButton'
import { SwitchSetting } from '../Components/SwitchSetting'
import { SETTINGS_ROUTES, SettingsRoutes } from '../SettingsNavigation'

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
			<SwitchSetting
				label={'Уведомления'}
				setting="notifications"
				key={Theme.key}
			/>

			<SettingsButton onPress={() => props.navigation.navigate('update')}>
				<SettingsText>{'' || SETTINGS_ROUTES.update}</SettingsText>
			</SettingsButton>
			<SettingsButton onPress={() => props.navigation.navigate('colors')}>
				<SettingsText>{'' || SETTINGS_ROUTES.colors}</SettingsText>
			</SettingsButton>
			<SettingsButton onPress={() => props.navigation.navigate('privacy')}>
				<SettingsText>{'' || SETTINGS_ROUTES.privacy}</SettingsText>
			</SettingsButton>
			{/* <SettingsButton onPress={() => props.navigation.navigate('terms')}>
				<SettingsText>{'' || SETTINGS_ROUTES.terms}</SettingsText>
			</SettingsButton> */}
			<SettingsButton onPress={() => props.navigation.navigate('about')}>
				<SettingsText>{'' || SETTINGS_ROUTES.about}</SettingsText>
			</SettingsButton>

			{/* <ScrollView>
                {Object.entries(Colors)
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([key, value]) => {
                        if (key.startsWith('$'))
                            return (
                                <View key={key} flex row spread centerV>
                                    <Text>{key}</Text>
                                    <View key={key} row spread centerV>
                                        <Text>{value}</Text>
                                        <ColorSwatch color={value} />
                                    </View>
                                </View>
                            )
                        else return false
                    })
                    .filter(Boolean)}
            </ScrollView> */}
		</ScrollView>
	)
})
