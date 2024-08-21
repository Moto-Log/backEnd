import { FastifyReply, FastifyRequest } from "fastify";
import { error404 } from "src/constants/httpMessages";
import { prisma } from "src/database/prisma";
import { Course, CreateCourse, UpdateCourse } from "src/interfaces/courses.interface";

export class CourseController {
    static async create(req: FastifyRequest<{Body: CreateCourse}>, res: FastifyReply): Promise<void> {
        try {
            const body = req.body;

            const course = await prisma.course.create({ data: { ...body } });

            res.send(course);
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async getAll(req: FastifyRequest, res: FastifyReply): Promise<void> {
        try {
            const courses = await prisma.course.findMany();

            res.send(courses);
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async getById(req: FastifyRequest<{Params: { id: string }}>, res: FastifyReply): Promise<void> {
        try {
            const id: string = req.params.id;
            const course = await prisma.course.findUnique({ where: { id }});

            if (course)
                res.send(course);
            else
                res.status(404).send(error404("Curso"));
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async update(req: FastifyRequest<{Body: UpdateCourse, Params: { id: string }}>, res: FastifyReply): Promise<void> {
        try {
            const courseBody = req.body;
            const id: string = req.params.id;

            let course: UpdateCourse = await prisma.course.findUnique({ where: { id } });

            if (!course)
                return res.status(404).send(error404("Curso"));           

            course = await prisma.course.update({
                data: { ...courseBody },
                where: { id }
            });

            res.send(course);
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async delete(req: FastifyRequest<{Params: { id: string }}>, res: FastifyReply): Promise<void> {
        try {
            const id: string = req.params.id;
            const course: Course = await prisma.course.findUnique({ where: { id }});

            if (!course)
                return res.status(404).send(error404("Curso"));  

            await prisma.course.delete({ where: { id } });

            res.send({ message: "Curso deletado com sucesso!"});
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }
}