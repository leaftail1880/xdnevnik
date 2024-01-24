import BackgroundTimer from 'react-native-background-timer'

interface Timer {
	fn: VoidFunction
	delay: number
}

const TIMERS = new Set<Timer>()

export function setBackgroundInterval(fn: VoidFunction, delay: number) {
	const timer = { fn, delay }
	TIMERS.add(timer)
	return timer
}

export function clearBackgroundInterval(timer: Timer) {
	TIMERS.delete(timer)
}

let TOTAL_TIME = 0
const DELAY = 1000

BackgroundTimer.runBackgroundTimer(() => {
	for (const timer of TIMERS) {
		if (TOTAL_TIME % timer.delay === 0) timer.fn()
	}

	TOTAL_TIME += DELAY
}, DELAY)
