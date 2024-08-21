import { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "src/database/prisma";
import { ICreatePreference } from "src/interfaces/preferences.interface";

export class PreferencesController {
    static async create(request: FastifyRequest<{ Body: ICreatePreference }>, response: FastifyReply): Promise<void> {
        try {
            const data = request.body;

            const alreadyExists = await prisma.preferences.findFirst({ where: data });

            if (alreadyExists)
                return response.status(409).send({ message: "Preferência já existente" });

            const preference = await prisma.preferences.create({ data });

            return response
                .status(201)
                .send(preference);

        } catch (error) {
            if (error instanceof Error)
                return response.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async getPreferencesByUser(request: FastifyRequest<{ Params: { id: string }}>, response: FastifyReply): Promise<void> {
        try {
            const { id } = request.params;
            const preferences = await prisma.preferences.findMany({ where: { employeeId: id }});

            return response.send(preferences);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async delete(request: FastifyRequest<{ Params: { id: string, employeeId: string }}>, response: FastifyReply): Promise<void> {
        try {
            const { id, employeeId } = request.params;
            const preferences = await prisma.preferences.delete({ where: { id, employeeId }});

            return response.send(preferences);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }
}