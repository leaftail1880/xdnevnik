import * as React from 'react'
import { StyleProp, TextStyle, ViewStyle } from 'react-native'

declare module 'react-native-select-dropdown' {
	export type SelectDropdownProps2<Item = object> = {
		/**
		 * array of data that will be represented in dropdown, can be array of objects
		 */
		data: Array<Item>
		/**
		 * function recieves selected item and its index in data array
		 */
		onSelect: (selectedItem: Item, index: number) => void
		/**
		 * default button text when no item is selected
		 */
		defaultButtonText?: string
		/**
		 * default selected item in dropdown
		 */
		defaultValue?: Item
		/**
		 * default selected item index
		 */
		defaultValueByIndex?: number
		/**
		 * disable dropdown
		 */
		disabled?: boolean
		/**
		 * disable auto scroll to selected value
		 */
		disableAutoScroll?: boolean
		/**
		 * disable click all Rows index in the list
		 */
		disabledIndexs?: number[]
		/**
		 * function fires when dropdown is opened
		 */
		onFocus?: () => void
		/**
		 * function fires when dropdown is closed
		 */
		onBlur?: () => void
		/**
		 * function fires when dropdown reaches the end
		 */
		onScrollEndReached?: () => void
		/**
		 * style object for button
		 */
		buttonStyle?: StyleProp<ViewStyle>
		/**
		 * style object for button text
		 */
		buttonTextStyle?: StyleProp<TextStyle>
		/**
		 * function that should return a React component for dropdown icon
		 */
		renderDropdownIcon?: (selectedItem: Item, index: number) => React.ReactNode
		/**
		 * dropdown icon position "left" || "right"
		 */
		dropdownIconPosition?: 'left' | 'right'
		/**
		 * required to set true when statusbar is translucent (android only)
		 */
		statusBarTranslucent?: boolean
		/**
		 * style object for dropdown view
		 */
		dropdownStyle?: StyleProp<ViewStyle>
		/**
		 * When true, shows a vertical scroll indicator in the dropdown.
		 */
		dropdownOverlayColor?: string
		/**
		 * backdrop color when dropdown is opened
		 */
		showsVerticalScrollIndicator?: boolean
		/**
		 * style object for row
		 */
		rowStyle?: StyleProp<ViewStyle>
		/**
		 * style object for row text
		 */
		rowTextStyle?: StyleProp<TextStyle>
		/**
		 * style object for selected row
		 */
		selectedRowStyle?: StyleProp<ViewStyle>
		/**
		 * style object for selected row text
		 */
		selectedRowTextStyle?: StyleProp<TextStyle>
		/**
		 * enable search functionality
		 */
		search?: boolean
		/**
		 * style object for search input
		 */
		searchInputStyle?: StyleProp<ViewStyle>
		/**
		 * text color for search input
		 */
		searchInputTxtColor?: string
		/**
		 * text style for search input
		 */
		searchInputTxtStyle?: StyleProp<TextStyle>
		/**
		 * placeholder text for search input
		 */
		searchPlaceHolder?: string
		/**
		 * text color for search input placeholder
		 */
		searchPlaceHolderColor?: string
		/**
		 * function callback when the search input text changes, this will automatically disable the dropdown's internal search to be implemented manually outside the component
		 */
		onChangeSearchInputText?: (searchText: string) => void
		/**
		 * function returns React component for search input icon
		 */
		renderSearchInputLeftIcon?: (
			selectedItem: Item,
			index: number
		) => React.ReactNode
		/**
		 * function returns React component for search input icon
		 */
		renderSearchInputRightIcon?: (
			selectedItem: Item,
			index: number
		) => React.ReactNode
	} & (
		| {
				/**
				 * function recieves selected item and its index, this function should return a string that will be represented in button after item is selected
				 */
				buttonTextAfterSelection: (selectedItem: Item, index: number) => string
		  }
		| {
				/**
				 * function recieves selected item and its index, this function should return a React component as a child for dropdown button buttonStyle should be used for parent button view style.
				 */
				renderCustomizedButtonChild?: (
					selectedItem: Item,
					index: number
				) => React.ReactNode
		  }
	) &
		(
			| {
					/**
					 * function recieves item and index for each row in dropdown, this function shoud return a string that will be represented in each row in dropdown
					 */
					rowTextForSelection: (item: Item, index: number) => string
			  }
			| {
					/**
					 * function recieves item and its index, this function should return React component as a child for customized row rowStyle should be used for parent row view style.
					 */
					renderCustomizedRowChild?: (
						selectedItem: Item,
						index: number,
						isSelected?: boolean
					) => React.ReactNode
			  }
		)

	export class Dropdown<Item = object> extends React.Component<
		SelectDropdownProps2<Item>
	> {
		/**
		 * Remove selection & reset it to display defaultButtonText check
		 */
		public reset(): void
		/**
		 * Open the dropdown.
		 */
		public openDropdown(): void
		/**
		 * Close the dropdown.
		 */
		public closeDropdown(): void
		/**
		 * Select index.
		 */
		public selectIndex(index: number): void
	}
}

import {
	default as LibDropdown,
	SelectDropdownProps2 as Props,
} from 'react-native-select-dropdown'
import { BorderRadiuses, Colors } from 'react-native-ui-lib'
import { SECONDARY_COLOR } from '../constants'

export function Dropdown<Item = object>(props: Props<Item>) {
	return (
		<LibDropdown
			{...props}
			dropdownStyle={[
				props.dropdownStyle,
				{
					backgroundColor: SECONDARY_COLOR,
					borderRadius: 10,
				},
			]}
			buttonStyle={[
				{
					alignSelf: 'center',
					width: '100%',
					backgroundColor: Colors.$backgroundPrimaryMedium,
					borderBottomLeftRadius: BorderRadiuses.br50,
					borderBottomRightRadius: BorderRadiuses.br50,
				},
				props.buttonStyle,
			]}
			buttonTextStyle={[{ color: Colors.$textPrimary }, props.buttonTextStyle]}
			rowStyle={[
				{ backgroundColor: Colors.$backgroundPrimaryMedium, borderRadius: 5 },
				props.rowStyle,
			]}
			rowTextStyle={[{ color: Colors.$textPrimary }, props.rowTextStyle]}
		/>
	)
}
