import { EModality, EShift } from "src/constants/definitions";
import { IGetUser } from "./user.interface";

export interface Subject {
    id:   string
    name: string
}

export interface ICreateSubject {
    name:    string
    course:  string
    period:  string
    chs:     string
    subarea: string
}

export interface IUpdateSubject {
	name?:    string
    course?:  string
    period?:  string
    chs?:     string
    subarea?: string
}

export interface IDetailedSubject {
	id: string;
	area: string;
	subarea: string;
	course: string;
	period: number;
	modality: EModality;
	shift: EShift;
	name: string;
	chs: number;
	employee: IGetUser | null;
}