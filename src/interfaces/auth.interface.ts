export interface ISignUp {
    name:         string;
    registration: string;
    email:        string;
    password:     string;
    role:         string;
	course?:	  string;
}

export interface ISignIn {
    registration: string;
    password:     string;
}