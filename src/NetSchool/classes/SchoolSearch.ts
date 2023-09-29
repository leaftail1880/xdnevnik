export interface School {
	id: number;
	inn: string;
	ogrn: string;
	name: string;
	cityId: number;
	address: null;
	shortName: string;
	provinceId: number;
}

export interface SchoolPreLoginData {
	countries: {
		id: number;
		name: string;
	}[];
	cid: number;
	states: {
		id: number;
		name: string;
	}[];
	sid: number;
	provinces: {
		kladr: string;
		id: number;
		name: string;
	}[];
	pid: number;
	cities: {
		atoTypeName: string;
		id: number;
		name: string;
	}[];
	cn: number;
	funcs: {
		id: number;
		name: string;
	}[];
	sft: number;
	schools: {
		id: number;
		name: string;
	}[];
	scid: number;
	hlevels?: any;
	ems?: any;
}
