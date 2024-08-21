import { FastifyInstance } from "fastify";
import { AreaController } from "src/controllers/area.controller";

export async function areaRoutes (fastify: FastifyInstance) {
    fastify.post("/",      AreaController.create);
    fastify.get("/",       AreaController.getAll);
    fastify.get("/:id",    AreaController.getById);
    fastify.patch("/:id",  AreaController.update);
    fastify.delete("/:id", AreaController.delete);
}