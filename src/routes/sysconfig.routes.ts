import { FastifyInstance } from "fastify";
import { SysConfigController } from "src/controllers/sysconfig.controller";
import { ZodValidator } from "src/middlewares/zod.validation";
import { SysConfigSchema } from "src/schemas/sysconfig.schema";

export async function sysConfigRoutes(fastify: FastifyInstance) {
    fastify.get("/", SysConfigController.getAll);
    fastify.post("/", { preHandler: ZodValidator(SysConfigSchema) }, SysConfigController.create);
    fastify.delete("/:id", SysConfigController.delete);
}