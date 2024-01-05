import AsyncStorage from '@react-native-async-storage/async-storage'
import Reactotron from 'reactotron-react-native'
import { logger } from './src/constants'

Reactotron.setAsyncStorageHandler(AsyncStorage)
	.configure({
		name: 'XDnevnik',
	}) // controls connection & communication settings
	.useReactNative() // add all built-in react native plugins
	.connect() // let's connect!

Reactotron.onCustomCommand({
	command: 'getItem',
	description: 'Gets item from AsyncStorage',
	args: [{ name: 'key', type: 'string' }],
	handler(args) {
		if (!args) return logger.debug('No args!')
		AsyncStorage.getItem(args.key).then(e => logger.debug(e))
	},
})

Reactotron.onCustomCommand({
	command: 'setItem',
	description: 'Gets item from AsyncStorage',
	args: [
		{ name: 'key', type: 'string' },
		{ name: 'value', type: 'string' },
	],
	handler(args) {
		if (!args) return logger.debug('No args!')
		AsyncStorage.setItem(args.key, args.value).then(() =>
			logger.debug('Set successfull')
		)
	},
})

Reactotron.onCustomCommand({
	command: 'removeItem',
	description: 'Gets item from AsyncStorage',
	args: [{ name: 'key', type: 'string' }],
	handler(args) {
		if (!args) return logger.debug('No args!')
		AsyncStorage.removeItem(args.key).then(() =>
			logger.debug('Remove successfull')
		)
	},
})
