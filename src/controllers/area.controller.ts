import { FastifyReply, FastifyRequest } from "fastify";
import { error404 } from "src/constants/httpMessages";
import { prisma } from "src/database/prisma";
import { Area, CreateArea, UpdateArea } from "src/interfaces/areas.interface";

export class AreaController {
    static async create(req: FastifyRequest<{Body: CreateArea}>, res: FastifyReply): Promise<void> {
        try {
            const body = req.body;

            const area = await prisma.area.create({ data: { ...body } });

            res.send(area);
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async getAll(req: FastifyRequest, res: FastifyReply): Promise<void> {
        try {
            const areas = await prisma.area.findMany();

            res.send(areas);
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async getById(req: FastifyRequest<{Params: { id: string }}>, res: FastifyReply): Promise<void> {
        try {
            const id: string = req.params.id;
            const area = await prisma.area.findUnique({ where: { id }});

            if (area)
                res.send(area);
            else
                res.status(404).send(error404("Area"));
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async update(req: FastifyRequest<{Body: UpdateArea, Params: { id: string }}>, res: FastifyReply): Promise<void> {
        try {
            const areaBody = req.body;
            const id: string = req.params.id;

            let area: UpdateArea = await prisma.area.findUnique({ where: { id } });

            if (!area)
                return res.status(404).send(error404("Area"));           

            area = await prisma.area.update({
                data: { ...areaBody },
                where: { id }
            });

            res.send(area);
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async delete(req: FastifyRequest<{Params: { id: string }}>, res: FastifyReply): Promise<void> {
        try {
            const id: string = req.params.id;
            const area: Area = await prisma.area.findUnique({ where: { id }});

            if (!area)
                return res.status(404).send(error404("Area"));  

            await prisma.area.delete({ where: { id } });

            res.send({ message: "Area deletada com sucesso!"});
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }
}