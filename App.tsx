// Initial setup & polyfills & monitoring
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import './src/utils/polyfill'

import './src/services/sentry'

import './src/utils/configure'

import { LANG } from './src/constants'

// External dependencies
import {
  NavigationContainer,
  NavigationContainerRef,
  CommonActions,
} from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as Sentry from '@sentry/react-native'
import { makeAutoObservable, toJS } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { View } from 'react-native'
import { BottomNavigation, Icon, PaperProvider, TouchableRipple } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Components
import Header from './src/components/Header'
import Loading from './src/components/Loading'
import Toast from './src/components/Modal'

// Services
import { API } from './src/services/net-school/api'
import './src/services/notifications/setup'
import { SENTRY_ROUTING } from './src/services/sentry'

// State
import { Theme, ThemeStore } from './src/models/theme'
import { StudentsStore } from './src/services/net-school/store'

// Screens
import DiaryScreen from './src/screens/day/screen'
import LoginScreen from './src/screens/login/in'
import SettingsScreen from './src/screens/settings/screen'
import TotalsNavigation from './src/screens/totals/screen'
import UsefullTools from './src/screens/usefull-tools/screen'

export type ParamListBase = Record<
  (typeof LANG)[
    | 's_log_in'
    | 's_log_out'
    | 's_totals'
    | 's_settings'
    | 's_diary'
    | 's_usefull_tools'],
  undefined
>

const ScreenIcons = {
  [LANG['s_log_in']]: 'login',
  [LANG['s_log_out']]: 'logout',
  [LANG['s_diary']]: 'book',
  [LANG['s_totals']]: 'school',
  [LANG['s_settings']]: 'cog',
  [LANG['s_usefull_tools']]: 'tools',
}

// Refactored route configuration to be less repetitive
const AppRoutes = [
  {
    name: LANG['s_log_in'] as keyof ParamListBase,
    component: LoginScreen,
    showCondition: () => !API.session,
  },
  {
    name: LANG['s_diary'] as keyof ParamListBase,
    component: DiaryScreen,
    showCondition: () => true,
  },
  {
    name: LANG['s_totals'] as keyof ParamListBase,
    component: TotalsNavigation,
    showCondition: () => true,
  },
  {
    name: LANG['s_settings'] as keyof ParamListBase,
    component: SettingsScreen,
    showCondition: () => true,
  },
  {
    name: LANG['s_usefull_tools'] as keyof ParamListBase,
    component: UsefullTools,
    showCondition: () => true,
  },
]

const Tab = createBottomTabNavigator<ParamListBase>()

import * as SplashScreen from 'expo-splash-screen'

SplashScreen.setOptions({
  duration: 400,
  fade: true,
})

// Custom Tab Bar Component using BottomNavigation.Bar
const CustomTabBar = observer(function CustomTabBar({ navigation, state, descriptors, insets }: any) {
  const theme = toJS(ThemeStore.meta(Theme).theme)

  return (
    <BottomNavigation.Bar
      navigationState={state}
      safeAreaInsets={insets}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        })

        if (event.defaultPrevented) {
          preventDefault()
        } else {
          navigation.dispatch({
            ...CommonActions.navigate(route.name, route.params),
            target: state.key,
          })
        }
      }}
      renderIcon={({ route, focused, color }) => {
        const iconName = ScreenIcons[route.title as keyof typeof ScreenIcons]
        return <Icon source={iconName} color={color} size={23} />
      }}
      getLabelText={({ route }) => {
        return route.name
      }}
      activeColor={theme.colors.onPrimaryContainer}
      inactiveColor={theme.colors.onSurfaceVariant}
      barStyle={{
        backgroundColor: theme.colors.navigationBar,
        height: 56, // Fixed height instead of percentage
      }}
      renderTouchable={(props) => <TouchableRipple {...props} />}
    />
  )
})

export default Sentry.wrap(
  observer(function App() {
    const navigation = useRef<NavigationContainerRef<ParamListBase>>(null)

    const { loading, theme } = ThemeStore.meta(Theme)
    if (loading) return AppStore.loadingTheme

    const ProvidedTheme = toJS(theme)
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider theme={ProvidedTheme}>
            <NavigationContainer
              theme={ProvidedTheme}
              ref={navigation}
              onReady={() =>
                SENTRY_ROUTING.registerNavigationContainer(navigation)
              }
            >
              <Navigation />
            </NavigationContainer>
            <Toast />
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    )
  }),
)

// Show header when component's custom header is not rendered
// eslint-disable-next-line mobx/missing-observer
function AppScreenFallback(props: { fallback: React.ReactNode }) {
  return (
    <View>
      <Header title="Загрузка..." />
      {props.fallback}
    </View>
  )
}

const AppStore = new (class AppStore {
  constructor() {
    makeAutoObservable(this, { loadingTheme: false })
  }

  get fallback() {
    let Fallback: React.ReactNode | undefined
    if (!API.session) {
      Fallback = <Loading text="Авторизация..." />
    } else if (StudentsStore.fallback) {
      Fallback = StudentsStore.fallback
    }

    return Fallback && (() => <AppScreenFallback fallback={Fallback} />)
  }

  loadingTheme = (
    <View
      style={{
        height: '100%',
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Loading text="Загрузка темы" />
    </View>
  )
})()

const Navigation = observer(function Navigation() {
  const FallbackScreen = AppStore.fallback
  const theme = toJS(ThemeStore.meta(Theme).theme)

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
      sceneContainerStyle={{
        backgroundColor: theme.colors.background,
      }}
    >
      {AppRoutes.map((route) => {
        if (!route.showCondition()) return null
        
        let Component = route.component
        // Apply fallback to specific screens that need it
        if (route.name !== LANG['s_log_in'] && route.name !== LANG['s_settings'] && FallbackScreen) {
          Component = FallbackScreen
        }

        return (
          <Tab.Screen
            key={route.name}
            name={route.name}
            component={Component}
          />
        )
      })}
    </Tab.Navigator>
  )
})
