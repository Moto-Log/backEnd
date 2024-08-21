import { FastifyInstance } from "fastify";
import { UserController } from "src/controllers/user.controller";

export async function employeeRoutes(fastify: FastifyInstance){
    fastify.get("/",       UserController.getAll);
    fastify.get("/:id",    UserController.getById);
    fastify.patch("/:id",  UserController.update);
    fastify.delete("/:id", UserController.delete);
}