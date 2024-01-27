import { createStackNavigator } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { MainSettings } from './Groups/Main'
import { UpdatesScreen } from './Groups/Update/Update'

type Routes = Record<'update' | 'main', undefined>

export const SettingsNavigation = createStackNavigator<Routes>()
const titles: Record<keyof Routes, string> = {
	main: 'Настройки ',
	update: 'Обновления',
}
export const SettingsScreen = observer(function SettingsScreen() {
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
