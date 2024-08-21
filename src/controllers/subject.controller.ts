import { Prisma } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { error404 } from "src/constants/httpMessages";
import { GENERIC_CATCH, message } from "src/constants/messages";
import { prisma } from "src/database/prisma";
import { ICreateSubject, IDetailedSubject, IUpdateSubject } from "src/interfaces/subjects.interface";

export class SubjectController {
    static async internalGetAllDetailed(where: Prisma.courseSubjectWhereInput): Promise<IDetailedSubject[] | null> {
        try {
            const subjects = [];
            const _SELECT = {
                id: true,
                course: { select: { name: true, modality: true, shift: true } },
                subject: {
                    select: {
                        name: true,
                        subjectSubarea: { select: { subarea: {
                            select: {
                                name: true,
                                area: { select: { name: true }}
                            }
                        }}}
                    }
                },
                chs: true,
                employee: { select: { name: true } },
                period: true,
            };

            const subjectRegisters = await prisma.courseSubject.findMany({ select: _SELECT, where });

            subjectRegisters.map(subjectRegister => {
                subjects.push({
                    id: subjectRegister.id,
                    area: subjectRegister.subject.subjectSubarea[0]?.subarea.area.name || null,
                    subarea: subjectRegister.subject.subjectSubarea[0]?.subarea.name || null,
                    course: subjectRegister.course.name,
                    period: subjectRegister.period,
                    modality: subjectRegister.course.modality,
                    shift: subjectRegister.course.shift,
                    name: subjectRegister.subject.name,
                    chs: subjectRegister.chs,
                    employee: subjectRegister.employee,
                });
            });

            return subjects;
        } catch (error) {
            message("error", GENERIC_CATCH, error);
            return null;
        }
    }
	
    static async getAll(request: FastifyRequest, response: FastifyReply): Promise<void> {
        try {
            const subjects = await prisma.subject.findMany();

            return response.send(subjects);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async getAllDetailed(request: FastifyRequest, response: FastifyReply): Promise<void> {
        try {
            const subjects = await SubjectController.internalGetAllDetailed({});

            return response.send(subjects);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async getAllDetailedByEmployeeId(request: FastifyRequest<{ Params: { id: string } }>, response: FastifyReply): Promise<void> {
        try {
            const { id } = request.params;
            const subjects = await SubjectController.internalGetAllDetailed({ employeeId: id });

            response.send(subjects);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async getAllDetailedById(request: FastifyRequest<{ Params: { id: string } }>, response: FastifyReply): Promise<void> {
        try {
            const { id } = request.params;
            const subject = await SubjectController.internalGetAllDetailed({ id });

            if (subject.length != 1) response.status(404).send(error404("Disciplina"));

            response.send(subject[0]);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async getAllDetailedByCourse(request: FastifyRequest<{ Params: { name: string } }>, response: FastifyReply): Promise<void> {
        try {
            const { name } = request.params;
            const subjects = await SubjectController.internalGetAllDetailed({ course: { name }});

            return response.send(subjects);
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async create(request: FastifyRequest<{ Body: ICreateSubject }>, response: FastifyReply): Promise<void> {
        try {
            const { name, subarea, course, period, chs } = request.body;
            const alreadyExists = await prisma.subject.findUnique({ where: { name } });

            if (alreadyExists)
                return response.status(409).send({ message: "Disciplina já existente"});
            
            const subareaRegister = await prisma.subarea.findUnique({ where: { name: subarea } });

            if (!subareaRegister)
                return response.status(404).send(error404("Eixo"));

            const courseRegister = await prisma.course.findUnique({ where: { name: course }});
      
            if (!courseRegister)
                return response.status(404).send(error404("Curso"));

            const subject = await prisma.subject.create({ 
                data: {
                    name,
                    subjectSubarea: { 
                        create: { subareaId: subareaRegister.id } 
                    }, 
                    courseSubject: { 
                        create: { 
                            period: Number(period),
                            chs: Number(chs), 
                            courseId: courseRegister.id }
                    } 
                }
            });
                
            return response.status(201).send(subject);
        } catch (error) {
            if (error instanceof Error)
                return response.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async update(request: FastifyRequest< {Body: IUpdateSubject, Params: { id: string } }>, response: FastifyReply): Promise<void> {
        try {
            const subjectId = request.params.id;
            const { name, subarea, course, period, chs } = request.body;

            const { id: subareaId } = await prisma.subarea.findUniqueOrThrow({
                where: {
                    name: subarea
                }
            });

            const {id: subjectSubareaId } = await prisma.subjectSubarea.findFirst({
                where: {
                    subareaId,
                    subjectId
                }
            });

            const { id: courseId } = await prisma.course.findUniqueOrThrow({
                where: {
                    name: course
                }
            });

            if (courseId === null || subareaId === courseId)
                return response.status(404).send(error404("Curso"));

            const {id: CourseSubjectId } = await prisma.courseSubject.findFirst({
                where: {
                    courseId,
                    subjectId
                }
            });

            const subject = await prisma.subject.update(
                {
                    data: {
                        name,
                        subjectSubarea: {
                            upsert: {
                                where: {
                                    id: subjectSubareaId
                                } ,
                                create: {
                                    subareaId
                                },
                                update: {
                                    subareaId
                                }
                            }
                        },
                        courseSubject: {
                            upsert: { 
                                where: {
                                    id: CourseSubjectId
                                } ,
                                create: {
                                    chs: chs ? Number(chs) : null,
                                    period: period ? Number(period) : null,
                                    courseId
                                },
                                update: {
                                    chs: chs ? Number(chs) : null,
                                    period: period ? Number(period) : null,
                                    courseId
                                }
                            }
                        }
                    },
                    where: {
                        id: subjectId
                    }
                }
            );

            return response.status(201).send(subject);
        } catch (error) {
            if (error instanceof Error)
                return response.status(500).send({ name: error.name, type: error.message});
        }
    }
}