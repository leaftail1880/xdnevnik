/* eslint-disable */
const { getSentryExpoConfig } = require('@sentry/react-native/metro')

const config = getSentryExpoConfig(__dirname)

module.exports = { ...config, resolver: { ...config.resolver, blockList: [config.resolver.blockList, /(\/amplify\/.*)$/], }, };

