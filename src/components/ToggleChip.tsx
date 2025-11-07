import { runInAction } from 'mobx'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { Chip } from 'react-native-paper'

export const ToggleChip = observer(function Filter<T extends object>(props: {
	store: T
	storeKey: keyof FilterObject<T, boolean>
	label: string
}) {
	const onPress = useCallback(() => {
		runInAction(
			() =>
				((props.store[props.storeKey] as boolean) =
					!props.store[props.storeKey]),
		)
	}, [props.store, props.storeKey])
	return (
		<Chip
			mode="flat"
			selected={props.store[props.storeKey] as boolean}
			compact
			onPress={onPress}
		>
			{props.label}
		</Chip>
	)
})
