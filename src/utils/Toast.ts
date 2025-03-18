import { makeAutoObservable, observable } from 'mobx'
import React from 'react'

interface BaseProps {
	title: string
	body?: React.ReactNode
	error?: boolean
}

interface ModalProps extends BaseProps {
	buttons?: ModalButton[]
}

interface ModalButton {
	label: React.ReactNode
	callback: VoidFunction
}

interface ToastProps extends BaseProps {
	timeout?: number
}

export const Toast = new (class {
	constructor() {
		makeAutoObservable<this, 'timeout'>(
			this,
			{ timeout: false },
			{ autoBind: true },
		)
	}

	private timeout: ReturnType<typeof setTimeout>

	state: ToastProps | null = null

	show({ title, body, error, timeout = 7000 }: ToastProps) {
		this.state = { title, body, error }
		if (this.timeout) clearTimeout(this.timeout)
		this.timeout = setTimeout(this.hide, timeout)
	}

	hide() {
		this.state = null
	}
})()

export const ModalAlert = new (class {
	constructor() {
		makeAutoObservable(this, { state: observable.shallow }, { autoBind: true })
	}

	state: ModalProps | null = null

	show(
		title: string,
		body?: React.ReactNode,
		error?: boolean,
		buttons: ModalButton[] = [],
	) {
		this.state = { title, body, error, buttons }
	}

	close() {
		this.state = null
	}
})()
