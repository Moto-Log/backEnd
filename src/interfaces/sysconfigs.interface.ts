export interface ISysConfigCreate {
	name: string;
	type: string;
	value: string;
}

export interface ISysConfig {
	id: string;
	name: string;
	type: string;
	value: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface ISysConfigProcessor {
	SUBJECT_INCIDENCE: string | null;
	COMMON_INCIDENCE: string | null;
	CHS_DIFF_ROLE_FACTOR: string | null;
	CHS_DIFF_LEVEL_IMPORTANCE_FACTOR: string | null;
}