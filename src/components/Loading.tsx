import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import { Text, TextProps } from 'react-native-ui-lib'

interface LoadingProps {
	/**
	 * {dots} can be used to set loading dots
	 */
	text?: string
}

const LoadingStore = new (class {
	dots = ''

	updateDots() {
		this.dots = this.dots.length > 4 ? '.' : this.dots + '.'
	}

	constructor() {
		makeAutoObservable(this)
		setInterval(() => this.updateDots(), 500)
	}
})()

export const Loading = observer(function Loading(
	props: LoadingProps & TextProps
) {
	// eslint-disable-next-line prefer-const
	let { text = 'Загрузка', ...textProps } = props
	if (!text.includes('{dots}')) text += '{dots}'

	return (
		<Text margin-s2 center {...textProps}>
			{text.replace(/\{dots\}/g, LoadingStore.dots)}
		</Text>
	)
})
