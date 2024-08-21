import { FastifyInstance } from "fastify";
import { SubjectController } from "src/controllers/subject.controller";
import { ZodValidator } from "src/middlewares/zod.validation";
import { SubjectSchema } from "src/schemas/subject.schema";

export async function subjectRoutes(fastify: FastifyInstance) {
    fastify.get("/", SubjectController.getAll);
    fastify.get("/relations", SubjectController.getAllDetailed);
    fastify.get("/relations/id/:id", SubjectController.getAllDetailedById);
    fastify.get("/relations/employee/:id", SubjectController.getAllDetailedByEmployeeId);
    fastify.get("/relations/course/:name", SubjectController.getAllDetailedByCourse);
    fastify.get("/course/:name", SubjectController.getAllDetailedByCourse);
    fastify.post("/", { preHandler: ZodValidator(SubjectSchema) }, SubjectController.create);
    fastify.post("/update-subject/:id", SubjectController.update);
}