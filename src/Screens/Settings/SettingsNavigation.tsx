import { createStackNavigator } from '@react-navigation/stack'

export const SETTINGS_ROUTES = {
	main: 'Настройки ',
	update: 'Обновления',
	colors: 'Тема, акцент и другой внешний вид',
	privacy: 'Политика конфиденциальности',
	terms: 'Правила и Условия пользования',
	about: 'О приложении',
}

export type SettingsRoutes = Record<keyof typeof SETTINGS_ROUTES, undefined>
export const SettingsNavigation = createStackNavigator<SettingsRoutes>()
