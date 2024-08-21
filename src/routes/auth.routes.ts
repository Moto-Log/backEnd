import { FastifyInstance } from "fastify";
import { AuthController } from "src/controllers/auth.controller";
import { ZodValidator } from "src/middlewares/zod.validation";
import { SignInSchema, SignUpSchema } from "src/schemas/auth.schema";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post("/signup", { preHandler: ZodValidator(SignUpSchema) }, AuthController.signUp);
    fastify.post("/signin", { preHandler: ZodValidator(SignInSchema) }, AuthController.signIn);
    fastify.get("/validate/docente", AuthController.validateAccessDocente);
    fastify.get("/validate/coordenador", AuthController.validateAccessCoordenador);
}