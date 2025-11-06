import BackgroundTimer from '@boterop/react-native-background-timer'

interface Timer {
	fn: VoidFunction
	delay: number
}

const timers = new Set<Timer>()

export function setBackgroundInterval(fn: VoidFunction, delay: number) {
	const timer: Timer = { fn, delay }
	timers.add(timer)

	return timer
}

export function clearBackgroundInterval(timer: Timer) {
	timers.delete(timer)
}

let elapsedTime = 0
const delay = 1000

BackgroundTimer.runBackgroundTimer(() => {
	for (const timer of timers) {
		if (elapsedTime % timer.delay === 0) timer.fn()
	}

	elapsedTime += delay
}, delay)
