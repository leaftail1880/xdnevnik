import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { ColorPicker, Colors } from 'react-native-ui-lib'
import { ACCENT_COLOR, Logger } from '../../../Setup/constants'
import { Theme } from '../../../Stores/Theme.store'
import { makeReloadPersistable } from '../../../Stores/makePersistable'

const AccentColorPickerState = new (class {
	constructor() {
		makeAutoObservable(this, {}, { autoBind: true })
		makeReloadPersistable(this, {
			properties: ['accentColors'],
			name: 'accentColorPicker',
		})
	}
	accentColors = [ACCENT_COLOR, '#467C7C', '#5D779E', '#967857', '#926759']
	expires = Date.now()
	setAccentColor(accentColor: string) {
		if (Date.now() > this.expires) {
			Theme.setAccentColor(accentColor)
			this.expires = Date.now() + 5000
		} else {
			Logger.debug('Timeout!')
		}
	}
	onSubmit(accentColor: string) {
		Theme.setAccentColor(accentColor)
		this.accentColors.push(accentColor)
	}
})()

export const AccentColorPicker = observer(function PickAccentColor() {
	return (
		<ColorPicker
			colors={AccentColorPickerState.accentColors}
			onValueChange={AccentColorPickerState.setAccentColor}
			backgroundColor={Colors.$backgroundDefault}
			onSubmit={AccentColorPickerState.onSubmit}
			initialColor={Theme.accentColor}
			key={Theme.key + 'accent'}
		/>
	)
})
