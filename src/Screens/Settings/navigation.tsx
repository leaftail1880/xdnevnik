import { createStackNavigator } from '@react-navigation/stack'

export const SETTINGS_ROUTES = {
	main: 'Настройки ',
	update: 'Обновления',
	colors: 'Тема',
	privacy: 'Политика конфиденциальности',
	terms: 'Правила и Условия пользования',
	notifs: 'Уведомления',
	advanced: 'Расширенные',
	support: 'Поддержка',
}

export type SettingsRoutes = Record<keyof typeof SETTINGS_ROUTES, undefined>
export const SettingsNavigation = createStackNavigator<SettingsRoutes>()
