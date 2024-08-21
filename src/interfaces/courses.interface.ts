export interface Course{
    id:       string
    name:     string
    shift:    string // turno
    modality: string // Modalidade (INTEGRADO, SUBSQUENTE, TÉCNOLOGO, GRADUAÇÃO)
}

export interface UpdateCourse{
    id?:       string
    name?:     string
    shift?:    string // turno
    modality?: string // Modalidade (INTEGRADO, SUBSQUENTE, TÉCNOLOGO, GRADUAÇÃO)
}

export interface CreateCourse{
    id:       string
    name:     string
    shift:    string // turno
    modality: string // Modalidade (INTEGRADO, SUBSQUENTE, TÉCNOLOGO, GRADUAÇÃO)
}