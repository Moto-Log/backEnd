import { compareSync } from "bcrypt";
import { FastifyReply, FastifyRequest } from "fastify";
import console from "node:console";
import { createCipheriv, createDecipheriv } from "node:crypto";
import { error404 } from "src/constants/httpMessages";
import { prisma } from "src/database/prisma";
import { ISignIn, ISignUp } from "src/interfaces/auth.interface";

export class AuthController {
    static async signUp(request: FastifyRequest<{ Body: ISignUp }>, response: FastifyReply) {
        try {		
            const { role, course, ...data } = request.body;
			
            const roleRegister = await prisma.role.findUnique({ where: { name: role } });

            if (!roleRegister)
                return response.status(404).send(error404("Cargo"));

            const userAlreadyExists = await prisma.employee.findUnique({ where: { registration: data.registration } });

            if (userAlreadyExists)
                return response.status(409).send({ message: "Usuário já cadastrado!" });

            if (roleRegister.name == "COORDENADOR") {
                if (!course)
                    return response.status(400).send({ message: "É necessário informar de qual curso é o coordenador" });

                const courseRegister = await prisma.course.findUnique({ where: { name: course } });

                if (!courseRegister)
                    return response.status(404).send(error404("Curso"));

                const employee = await prisma.employee.create({
                    data: {
                        ...data,
                        role: { connect: { id: roleRegister.id }},
                        course: { connect: { id: courseRegister.id }}  
                    }
                });
		
                return response
                    .status(201)
                    .send(employee);
            } else {
                const employee = await prisma.employee.create({
                    data: {
                        ...data,
                        role: { connect: { id: roleRegister.id }},
                    }
                });
	
                return response
                    .status(201)
                    .send(employee);
            }
        } catch (error) {
            if (error instanceof Error)
                response.status(500).send({ name: error.name, type: error.message});
        }
    }
	
    static async signIn(request: FastifyRequest<{ Body: ISignIn }>, response: FastifyReply) {
        try {
            const { registration, password } = request.body;

            const findUser = await prisma.employee.findUnique({ where: { registration } });

            if (!findUser)
                return response.status(400).send({ message: "Usuário e/ou senha incorretas!" });

            if (!compareSync(password, findUser.password))
                return response.status(400).send({ message: "Usuário e/ou senha incorretas!" });

            const payload = { id: findUser.id, role: findUser.roleId };

            if (!process.env.AES_KEY || !process.env.AES_INITIAL_VECTOR || !process.env.AES_ALGORITHM)
                throw new Error("AES Keys not found in .env");

            const cipher = createCipheriv(process.env.AES_ALGORITHM, process.env.AES_KEY, Buffer.from(process.env.AES_INITIAL_VECTOR));
            let encrypted_payload = cipher.update(JSON.stringify(payload), "utf8", "hex");
            encrypted_payload += cipher.final("hex");

            const access_token = request.jwt.sign({ data: encrypted_payload }, { algorithm: "HS256" });

            response.setCookie("access_token", access_token, {
                httpOnly: true,
                path: "/",
                maxAge: 60*60*24
            });

            return response.send({ access_token });

        } catch (error) {
            console.error(error);
            if (error instanceof Error)
                return response.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async validateAccessDocente(request: FastifyRequest, response: FastifyReply) {
        try {
            const token = request.headers["authorization"];

            if (!token) return response.status(401).send({ message: "Acesso negado!" });

            const encrypted_payload = request.jwt.decode(token.split(" ")[1]) as { data: string, iat: number };

            if (!encrypted_payload.data) return response.status(401).send({ message: "Acesso negado!" });

            if (!process.env.AES_KEY || !process.env.AES_INITIAL_VECTOR || !process.env.AES_ALGORITHM)
                throw new Error("AES Keys not found in .env");

            const decipher = createDecipheriv(process.env.AES_ALGORITHM, process.env.AES_KEY, Buffer.from(process.env.AES_INITIAL_VECTOR));
            let payload = decipher.update(encrypted_payload.data, "hex", "utf8");
            payload += decipher.final("utf8");

            return response.send({ data: JSON.parse(payload) });
        } catch (error) {
            console.error(error);
            if (error instanceof Error)
                return response.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async validateAccessCoordenador(request: FastifyRequest, response: FastifyReply) {
        try {
            const token = request.headers["authorization"];

            if (!token) return response.status(401).send({ message: "Acesso negado!" });

            const encrypted_payload = request.jwt.decode(token.split(" ")[1]) as { data: string, iat: number };

            if (!encrypted_payload.data) return response.status(401).send({ message: "Acesso negado!" });

            if (!process.env.AES_KEY || !process.env.AES_INITIAL_VECTOR || !process.env.AES_ALGORITHM)
                throw new Error("AES Keys not found in .env");

            const decipher = createDecipheriv(process.env.AES_ALGORITHM, process.env.AES_KEY, Buffer.from(process.env.AES_INITIAL_VECTOR));
            let payload = decipher.update(encrypted_payload.data, "hex", "utf8");
            payload += decipher.final("utf8");

            const data = JSON.parse(payload);

            const findRegister = await prisma.employee.findUnique({
                where: { id: data.id },
                select: {
                    role: { select: { name: true } },
                    course: { select: { name: true }},
                }
            });

            if (findRegister && findRegister.role.name === "COORDENADOR") {
                data["course"] = findRegister.course.name;
                return response.send({ data });
            } else {
                return response.status(401).send({ message: "Não autorizado!" });
            }
        } catch (error) {
            console.error(error);
            if (error instanceof Error)
                return response.status(500).send({ name: error.name, type: error.message});
        }
    }
}