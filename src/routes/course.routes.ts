import { FastifyInstance } from "fastify";
import { CourseController } from "src/controllers/course.controller";

export async function courseRoutes(fastify: FastifyInstance){
    fastify.post("/",      CourseController.create);
    fastify.get("/",       CourseController.getAll);
    fastify.get("/:id",    CourseController.getById);
    fastify.patch("/:id",  CourseController.update);
    fastify.delete("/:id", CourseController.delete);
}