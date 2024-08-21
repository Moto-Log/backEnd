import { hashSync } from "bcrypt";
import { z } from "zod";
import { ERoles } from "../interfaces/roles.interface";

export const SignUpSchema = z.object({
    name: z.string().min(10).max(255),
    registration: z
        .string()
        .refine(value => !/[^0-9]/g.test(value), {
            message: "Este campo aceita apenas números"
        })
        .refine(value => value.length == 10, {
            message: "O tamanho deste campo precisa ser de 10 caracteres"
        }),
    email: z.string().email(),
    password: z
        .string()
        .min(6)
        .max(255)
        .transform(value => hashSync(value, 10)),
    role: z.nativeEnum(ERoles),
    course: z.string().min(2).max(255).optional()
});

export const SignInSchema = z.object({
    registration: z
        .string()
        .refine(value => !/[^0-9]/g.test(value), {
            message: "Este campo aceita apenas números"
        })
        .refine(value => value.length == 10, {
            message: "O tamanho deste campo precisa ser de 10 caracteres"
        }),
    password: z
        .string()
        .min(6)
        .max(255)
});