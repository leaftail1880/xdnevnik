import Day, { DayObject } from "./Day";

export interface DiaryObject {
	weekEnd: string;
	termName: string;
	weekDays?: DayObject[];
	weekStart: string;
	className: string;
}

export default class Diary {
	days: Day[];
	termName: string;
	className: string;

	private _end: string;
	private _start: string;

	constructor(diary: DiaryObject) {
		this.days = diary.weekDays?.map((d) => new Day(d)) ?? [];
		this.termName = diary.termName;
		this.className = diary.className;
		this._end = diary.weekEnd;
		this._start = diary.weekStart;
	}

	get start() {
		return new Date(this._start);
	}

	get end() {
		return new Date(this._end);
	}

	slice({ start, end }: { start: Date; end: Date }) {
		return this.days.filter(({ date }) => date >= start && date < end);
	}

	currentLesson(date: Date) {
		const lessons = this.days.map((d) => d.lessons).flat();

		return (
			lessons.find(({ start, end }) => date >= start && date < end) ?? null
		);
	}
}
