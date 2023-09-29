import { NSEntity } from "../api";

export class NetSchoolContext {
	user: NSEntity;
	year: {
		id: number;
		gId: number;
		name: string;
		start: Date;
		end: Date;
	};
	server: {
		id: string;
		timeFormat: string;
		dateFormat: string;
	};
	school: {
		id: number;
		name: string;
		fullName: string;
	};
	students: NSEntity[];

	constructor(
		credentials: Pick<
			NetSchoolContext,
			"user" | "year" | "server" | "school" | "students"
		>
	) {
		this.school = credentials.school;
		this.server = credentials.server;
		this.students = credentials.students;
		this.user = credentials.user;
		this.year = credentials.year;
	}

	/** Проверяет является ли число частью года */
	checkDate(date: Date) {
		const { start, end } = this.year;
		return +start <= +date && +date <= +end;
	}
}

export interface NetSchoolFetchedContext {
	at: string;
	user: {
		id: number;
		name: string;
	};
	emId?: any;
	roles: string[];
	rights: string[];
	userId: number;
	version: string;
	schoolId: number;
	funcType: string;
	dateFormat: string;
	timeFormat: string;
	schoolyear: {
		id: number;
		name: string;
		closed: string;
		endDate: Date;
		schoolId: number;
		startDate: Date;
		globalYear: {
			id: number;
			name: string;
			endDate: Date;
			startDate: Date;
		};
	};
	productName: string;
	versionDate?: any;
	schoolYearId: number;
	globalYearId: number;
	userLanguage: string;
	organization: {
		id: number;
		name: string;
	};
	organizationName: string;
}

export type NetSchoolFetchedContextStudents = NSEntity[];
