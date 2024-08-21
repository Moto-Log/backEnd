import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "src/database/prisma";
import { ISysConfigCreate } from "src/interfaces/sysconfigs.interface";

export class SysConfigController {
    static async getAll(request: FastifyRequest, response: FastifyReply) {
        try {
            const sysconfigs = await prisma.sysconfig.findMany();

            return response.send(sysconfigs);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async create(request: FastifyRequest<{ Body: ISysConfigCreate }>, response: FastifyReply) {
        try {
            const data = request.body;
            const sysconfig = await prisma.sysconfig.create({ data });

            return response.status(201).send(sysconfig);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async delete(request: FastifyRequest<{ Params: { id: string } }>, response: FastifyReply) {
        try {
            const { id } = request.params;
            const sysconfig = await prisma.sysconfig.delete({ where: { id }});

            return response.send(sysconfig);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }
}