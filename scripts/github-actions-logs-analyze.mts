import chalk from 'chalk'
import fs from 'node:fs'

const file = process.argv[2]
const content = fs.readFileSync(file, 'utf-8')
const lines = content
	.split('\n')
	.map(line => ({ line: line, date: new Date(line.split(' ', 1)[0]) }))
const linesWithTime = lines.map((e, i, a) => {
	const prev = a[i + 1]?.date ?? e.date
	return { ...e, offset: prev.getTime() - e.date.getTime() }
})

const colors = [
	[0, chalk.green],
	[1000, chalk.greenBright],
	[2000, chalk.yellow],
	[4000, chalk.red],
] as const

for (const line of linesWithTime) {
	if (line.offset < 200) continue
	const color =
		colors.toReversed().find(e => line.offset > e[0])?.[1] ?? colors[0][1]
	console.log(`${line.offset.toString().padStart(8, ' ')} ${color(line.line)}`)
}
