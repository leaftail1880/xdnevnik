type Mark = {
	assignmentId: number;
	studentId: number;
	mark: number;
	dutyMark: boolean;
};

type TextAnswer = {
	answer: string;
	answerDate: Date;
};

export interface AssignmentObject {
	id: number;
	typeId: number;
	dueDate: string;
	mark?: Mark;
	markComment?: {
		id: number;
		name: string;
		teacher: string;
		wasRead: boolean;
		editTime: string;
	};
	textAnswer?: TextAnswer;
	assignmentName: string;
	classMeetingId: number;
}

export default class Assignment {
	id: number;
	dot: boolean;
	text: string;
	mark?: number;
	typeId: number;
	comment?: string;
	lessonId: number;

	private _date: string;
	private _answer?: TextAnswer;

	constructor(assignment: AssignmentObject) {
		this.id = assignment.id;
		this.dot = assignment.mark?.dutyMark ?? false;
		this.text = assignment.assignmentName;
		this.mark = assignment.mark?.mark;
		this.typeId = assignment.typeId;
		this.comment = assignment.markComment?.name;
		this.lessonId = assignment.classMeetingId;

		this._date = assignment.dueDate;
		this._answer = assignment.textAnswer;
	}

	get date() {
		return new Date(this._date);
	}
	get answer() {
		if (!this._answer) return undefined;

		return {
			date: new Date(this._answer.answerDate),
			text: this._answer.answer,
		};
	}

	toJSON() {
		const answer = !this._answer
			? undefined
			: {
					date: this._answer.answerDate,
					text: this._answer.answer,
			  };

		return {
			id: this.id,
			dot: this.dot,
			text: this.text,
			mark: this.mark,
			answer,
			typeId: this.typeId,
			lessonId: this.lessonId,
		};
	}
}

export interface AssignmentInfo {
	id: number;
	date: string;
	weight: number;
	teacher: {
		id: number;
		name: string;
	};
	teachers?: {
		id: number;
		name: string;
	}[];
	isDeleted: boolean;
	description: string;
	subjectGroup: {
		id: number;
		name: string;
	};
	assignmentName: string;
}
