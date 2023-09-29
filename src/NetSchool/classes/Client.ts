import { URL, URLSearchParams } from "react-native-url-polyfill";

// export type DecodeCookie = { [key: string]: string };
export type ExtraHeaders = { key: string; value: string | Function }[];
export type ExtraHeadersRaw = { [key: string]: string };

export interface InitRequest extends RequestInit {
	params?: { [key: string]: any };
}

export default class Client {
	static formData(
		body: { [key: string]: any },
		init?: InitRequest
	): InitRequest {
		const data: string[] = [];
		for (let key in body) data.push(key + "=" + body[key]);

		return {
			...init,
			body: encodeURI(data.join("&")),
			headers: {
				...init?.headers,
				"Content-Type": "application/x-www-form-urlencoded",
			},
		};
	}

	private origin: string;

	isAbsolute(path: string) {
		return /^(?:[a-z]+:)?\/\//i.test(path);
	}

	constructor(origin: string) {
		if (!this.isAbsolute(origin))
			throw new Error("origin must be an absolute path, recieved " + origin);

		this.origin = new URL(origin).origin;
		this.headers.set("Origin", this.origin);
		this.headers.set("Referer", this.origin);
		// this.headers.set("Cookie", () => this.cookie.get());
	}

	// private _cookie: { [key: string]: string } = {};
	// private cookie = {
	// 	get: () => {
	// 		const cookies = [];
	// 		for (let name in this._cookie)
	// 			cookies.push(name + "=" + this._cookie[name]);

	// 		return cookies.join("; ");
	// 	},
	// 	set: (cookies?: string[]) => {
	// 		cookies
	// 			.map((cookie) => cookie.substring(0, cookie.indexOf("")))
	// 			.forEach((cookie) => {
	// 				const i = cookie.indexOf("=");
	// 				const key = cookie.substring(0, i);
	// 				const val = cookie.substring(i + 1);

	// 				this._cookie[key] = val;
	// 			});

	// 		return this.cookie.get();
	// 	},
	// };

	private _headers: ExtraHeaders = [];
	public headers = {
		get: () => {
			let data: ExtraHeadersRaw = {};

			for (let { key, value } of this._headers) {
				const result = typeof value === "function" ? value() : value;

				if (!result) continue;
				else data[key] = result;
			}

			return data;
		},
		set: (key: string, value: string | Function) => {
			const index = this._headers.findIndex((h) => h.key === key);

			if (index !== -1) this._headers[index] = { key, value };
			else this._headers.push({ key, value });
			return this.headers.get();
		},
	};

	public path = "/webapi";
	public join(paths: string) {
		return [this.origin, this.path, paths]
			.map((e) => (e.endsWith("/") ? e : e + "/").replace(/^\//, ""))
			.join("");
	}

	private async isSecurityWarning(res: Response) {
		return (
			res.headers.get("content-type")?.includes?.("text/html") &&
			+(res.headers.get("content-length") ?? "") < 1000 &&
			!res.headers.has("filename") &&
			(await res.clone().text()).includes("/asp/SecurityWarning.asp")
		);
	}

	public async request(url: string, init?: InitRequest): Promise<Response> {
		if (!this.isAbsolute(url)) url = this.join(url);
		if (init?.params) url += "?" + new URLSearchParams(init.params).toString();

		const res = await fetch(url, {
			...init,
			headers: {
				...this.headers.get(),
				...init?.headers,
			},
		});
		if (!res.ok) {
			const error = new Error(
				`${this.getErrorReason(res.status)}\nКод ошибки сервера: ${res.status}`
			);
			console.error(
				`NetSchoolFetch failed with status ${res.status} URL: ${url}`
			);
			throw error;
		}
		if (await this.isSecurityWarning(res)) {
			await this.post(
				"../asp/SecurityWarning.asp",
				Client.formData({
					at: this.headers.get().at,
					WarnType: 2,
				})
			);
			return this.request(url, init);
		}

		// console.log(
		// 	"Cookies: ",
		// 	res.headers.get("set-cookie"),
		// 	res.headers["set-cookie"]
		// );
		// this.cookie.set(res.headers["set-cookie"]);

		return res;
	}

	private getErrorReason(code: number) {
		return {
			503: "Сервер дневника недоступен. Попробуйте позже или загрузите данные из кэша",
			401: "Недостаточно прав или ошибка авторизации",
		}[code];
	}

	public get(url: string, init?: Omit<InitRequest, "method">) {
		return this.request(url, { ...init, method: "get" });
	}

	public post(url: string, init?: Omit<InitRequest, "method">) {
		return this.request(url, { ...init, method: "post" });
	}
}
