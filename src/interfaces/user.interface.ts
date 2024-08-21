export interface UpdateEmployee {
    name?:         string;
    registration?: string;
    email?:        string;
    password?:     string;
    roleId?:       string;
}

export interface IUserToProcess {
	id: string;
	type: string;
	value: string;
	chs: number;
	max_chs: number;
}

export interface IUserToProcessFormatted {
	id: string;
	preferences: Array<{
		type: string;
		value: string;
	}>,
	chs: number;
	max_chs: number;
}

export interface IUserQueue {
	id: string;
    weight: number;
    chs: number;
    max_chs: number;
	subject_affinity: boolean;
}

export interface IGetUser {
	id: string;
	name: string;
	registration: string;
	email: string;
	password: string;
	roleId: string;
	courseId: string;
	createdAt: string;
	updatedAt: string;
}