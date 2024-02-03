import { createStackNavigator } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { Theme } from '../../Stores/Theme.store'
import { MainSettings } from './Groups/Main'
import { UpdatesScreen } from './Groups/Update/Update'

const titles = {
	main: 'Настройки ',
	update: 'Обновления',
  privacy: "Политика конфиденциальности",
  terms: ""

}

type Routes = Record<keyof typeof titles, undefined>
export const SettingsNavigation = createStackNavigator<Routes>()

export const SettingsScreen = observer(function SettingsScreen() {
	Theme.key
	return (
		<SettingsNavigation.Navigator
			initialRouteName="main"
			screenOptions={a => {
				return { title: titles[a.route.name] }
			}}
		>
			<SettingsNavigation.Screen name="main" component={MainSettings} />
			<SettingsNavigation.Screen name="update" component={UpdatesScreen} />
		</SettingsNavigation.Navigator>
	)
})
