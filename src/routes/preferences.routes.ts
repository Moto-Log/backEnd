import { FastifyInstance } from "fastify";
import { PreferencesController } from "src/controllers/preferences.controller";
import { ZodValidator } from "src/middlewares/zod.validation";
import { PreferencesSchema } from "src/schemas/preferences.schema";

export async function preferencesRoutes(fastify: FastifyInstance) {
    fastify.get("/:id", PreferencesController.getPreferencesByUser);
    fastify.post("/", { preHandler: ZodValidator(PreferencesSchema) }, PreferencesController.create);
    fastify.delete("/:employeeId/:id", PreferencesController.delete);
}