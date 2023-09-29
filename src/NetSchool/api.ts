import md5 from "md5";
import { AssignmentInfo } from "./classes/Assignment";
import Client from "./classes/Client";
import {
	NetSchoolContext,
	NetSchoolFetchedContext,
	NetSchoolFetchedContextStudents,
} from "./classes/Context";
import Diary, { DiaryObject } from "./classes/Diary";
import Info from "./classes/Info";
import { School } from "./classes/SchoolSearch";
import Session from "./classes/Session";

export interface NSEntity {
	id: number;
	name: string;
}

export type PasswordType = string | { hash: string; length: number };

export interface Credentials {
	school: School;
	login: string;
	password: PasswordType;
}

export type Endpoints = Awaited<
	ReturnType<(typeof NetSchoolApi)["getEndpoints"]>
>;

export default class NetSchoolApi {
	static async getEndpoints() {
		return new Client("https://mobile.ir-tech.ru/")
			.get("https://mobile.ir-tech.ru/api/v1/mobile/parent/end-points")
			.then(
				(res) =>
					res.json() as Promise<{
						items: { name: string; url: string; demo: boolean }[];
					}>
			)
			.then((e) =>
				e.items
					.filter((e) => !e.demo && !/demo/i.test(e.name))
					.map((e) => {
						return { name: e.name, url: e.url };
					})
			);
	}

	public context: null | NetSchoolContext = null;
	protected session: null | Session = null;
	protected client: Client;

	/**
	 * Создание пользователя
	 * @param credentials Данные пользователя
	 */
	constructor(origin: string) {
		this.client = new Client(origin);
		this.client.headers.set("at", () =>
			this.session?.isValid() ? this.session.accessToken : undefined
		);
	}

	async getSchools() {
		return this.client
			.get("schools/search")
			.then((res) => res.json() as Promise<School[]>)
			.then((schools) =>
				schools.filter((school) => !/детский сад/i.test(school.name))
			);
	}

	async logIn(credentials: Credentials) {
		const [{ lt, ver, salt }] = await Promise.all([
			this.client
				.post("/auth/getData")
				.then((res) => res.json() as Promise<Record<string, string>>),

			// Сохранение куки
			this.client.get("logindata"),
		]);

		if (!lt || !ver || !salt) {
			throw new Error("Сетевой не вернул данные для авторизации.");
		}

		function md5a(str: string): string {
			return md5(str);
		}

		const hash =
			typeof credentials.password === "string"
				? md5a(credentials.password)
				: credentials.password.hash;

		const pw2 = md5a(salt + hash);
		const pw = pw2.substring(0, credentials.password.length);

		const credentialsToSave = {
			password: {
				hash,
				length: credentials.password.length,
			},
			login: credentials.login,
			school: credentials.school,
		};

		const loginForm = {
			un: credentials.login,
			lt,
			ver,
			loginType: 1,
			pw,
			pw2,
			pid: credentials.school.provinceId,
			cn: credentials.school.cityId,
			sft: 2,
			scid: credentials.school.id,
		};

		// console.log(loginForm);

		const {
			at: accessToken,
			timeOut,
		}: {
			at: string;
			timeOut: number;
		} = await this.client
			.post("/login", Client.formData(loginForm))
			.then((res) => res.json() as any)
			.catch((e) => {
				console.error("LOGIN FAILED");
				throw e;
			});

		console.info("LOGIN SUCCESSED");

		this.session = new Session({
			ver,
			accessToken,
			expiryDate: Date.now() + timeOut,
		});

		if (this.context) return credentialsToSave;

		const [sysInfo, context, students] = (await Promise.all([
			this.client.get("sysInfo").then((res) => res.text()),
			this.client.get("context").then((res) => res.json()),
			this.client.get("context/students").then((res) => res.json()),
		])) as [string, NetSchoolFetchedContext, NetSchoolFetchedContextStudents];

		const schoolInfo = (await this.client
			.get(`schools/${context.schoolId}/card`)
			.then((res) => res.json())) as {
			commonInfo: {
				schoolName: string;
				fullSchoolName: string;
			};
		};

		// console.log("cookie set test");

		// console.log(
		// 	"set",
		// 	(await fetch("https://httpbin.org/cookies/set/fetch/value")).ok
		// );

		// console.log(
		// 	"get",
		// 	await (await fetch("https://httpbin.org/cookies")).text()
		// );

		// const client = new Client("https://httpbin.org/");

		// console.log(
		// 	"setc",
		// 	(await client.get("https://httpbin.org/cookies/set/c/value")).ok
		// );

		// console.log(
		// 	"getc",
		// 	await (await client.get("https://httpbin.org/cookies")).json()
		// );

		// console.log("cookie set test end");

		this.context = new NetSchoolContext({
			year: {
				id: context.schoolyear.id,
				gId: context.schoolyear.globalYear.id,
				name: context.schoolyear.name,
				start: new Date(context.schoolyear.startDate),
				end: new Date(context.schoolyear.endDate),
			},
			user: { id: context.user.id, name: context.user.name },
			server: {
				id: sysInfo.match(/Id: (.+)/)?.[1] ?? "",
				dateFormat: context.dateFormat,
				timeFormat: context.timeFormat,
			},
			school: {
				fullName: schoolInfo.commonInfo.fullSchoolName,
				name: schoolInfo.commonInfo.schoolName,
				id: context.schoolId,
			},
			students,
		});

		return credentialsToSave;
	}

	private dateValid(...dates: Date[]) {
		if (!this.context) throw new Error("Авторизуйся!");
		for (let date of dates) {
			const { start, end } = this.context.year;
			if (!(+start <= +date && +date <= +end))
				throw new Error("Дата выходит за рамки учебного года");
		}

		return true;
	}

	async logOut() {
		if (!this.session) throw new Error("Авторизуйся!");

		await this.client.post(
			"auth/logout",
			Client.formData({
				at: this.session.accessToken,
				ver: this.session.ver,
			})
		);

		this.session = null;
	}

	async sessionValid() {
		if (!this.session) return false;

		const { accessToken: token } = this.session;

		return this.client
			.get("context/expired", { params: { token } })
			.then((res) => res.json())
			.then((b) => (typeof b == "boolean" ? !b : false));
	}

	// ⭐️ Пользователь
	async info() {
		return this.client
			.get("mysettings")
			.then((res) => res.json())
			.then((data) => new Info(data as any));
	}

	// ⭐️ Дневник
	async diary(credentials: { studentId: number; start?: Date; end?: Date }) {
		if (!this.context) throw new Error("Авторизуйся!");

		let { studentId, start, end } = credentials;
		if (start && end) this.dateValid(start, end);
		else {
			const { weekStart } = await this.client
				.get("student/diary/init")
				.then((res) => res.json() as any);

			start = new Date(weekStart);
			end = new Date(weekStart);
			end.setDate(end.getDate() + 7);
		}

		const diaryRaw = await this.client
			.get("student/diary", {
				params: {
					yearId: this.context.year.id,
					studentId,
					weekEnd: end.toJSON().replace(/T.+/, ""),
					weekStart: start.toJSON().replace(/T.+/, ""),
				},
			})
			.then((res) => res.json() as Promise<DiaryObject>);

		return new Diary(diaryRaw);
	}

	/** Информация о задание */
	async assignment(credentials: { studentId?: number; id: number }) {
		let { id, studentId } = credentials;

		return this.client
			.get(`student/diary/assigns/${id}`, { params: { studentId } })
			.then((res) => res.json() as Promise<AssignmentInfo>);
	}

	/** Типы заданий */
	async assignmentTypes() {
		return this.client
			.get("grade/assignment/types", { params: { all: false } })
			.then(
				(res) =>
					res.json() as Promise<
						{
							id: number;
							name: string;
							abbr: string;
							order: number;
						}[]
					>
			);
	}

	// ⭐️ Расписание

	/** Расписание на неделю */
	scheduleWeek(credentials?: { date?: Date; classId?: number }) {
		// TODO! Implement
	}
}
