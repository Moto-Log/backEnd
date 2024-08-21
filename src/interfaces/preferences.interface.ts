export enum EPreferenceTypes {
	"modality" = "modality",
	"shift" = "shift",
	"subject" = "subject",
	"period" = "period",
	"subarea" = "subarea",
	"course" = "course",
}

export interface ICreatePreference {
    type:       EPreferenceTypes
    value:      string
    employeeId: string
}

export interface IPreference {
	id: 	    string;
    type:       EPreferenceTypes
    value:      string
    employeeId: string
}