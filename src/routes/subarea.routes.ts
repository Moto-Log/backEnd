import { FastifyInstance } from "fastify";
import { SubareaController } from "src/controllers/subarea.controller";

export async function subareaRoutes (fastify: FastifyInstance) {
    // fastify.post("/",      SubareaController.create);
    fastify.get("/",       SubareaController.getAll);
    fastify.get("/:id",    SubareaController.getById);
    // fastify.patch("/:id",  SubareaController.update);
    // fastify.delete("/:id", SubareaController.delete);
}