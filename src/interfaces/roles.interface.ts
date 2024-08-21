export interface Role {
    id:   string
    name: string
    chs:  number;
}

export enum ERoles {
    "ADMIN" = "ADMIN",
    "COORDENADOR" = "COORDENADOR",
    "DOCENTE" = "DOCENTE",
}
export type TRoles = "ADMIN" | "COORDENADOR" | "DOCENTE";