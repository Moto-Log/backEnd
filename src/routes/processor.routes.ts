import { FastifyInstance } from "fastify";
import { ProcessorController } from "src/controllers/processor.controller";

export async function processorRoutes(fastify: FastifyInstance) {
    fastify.post("/", ProcessorController.runTask);   
    fastify.delete("/", ProcessorController.clearDistribution);   
}