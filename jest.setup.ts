
import React from 'react';
globalThis.React = React
globalThis.__TEST__ = true

process.env.EXPO_OS ??= 'android'

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  reactNavigationIntegration: jest.fn(),
  setContext: jest.fn()
}));

jest.mock('react-native-webview', () => {
  const rn = jest.requireActual('react-native')
  return rn.View
})

jest.mock('react-native-nitro-modules', () => ({}));
