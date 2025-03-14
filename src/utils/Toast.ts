import { makeAutoObservable, observable } from 'mobx'
import React from 'react'

type ModalInfo = {
	title: string
	body?: React.ReactNode
	error?: boolean
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

	state: ModalInfo | null = null

	show({
		title,
		body,
		error,
		timeout = 7000,
	}: ModalInfo & { timeout?: number }) {
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
		makeAutoObservable(this, { state: observable.shallow }, { autoBind: false })
	}

	state: ModalInfo | null = null

	show(title: string, body?: React.ReactNode, error?: boolean) {
		this.state = { title, body, error }
	}

	close() {
		ModalAlert.state = null
	}
})()
