import { FastifyReply, FastifyRequest } from "fastify";
import { error404 } from "src/constants/httpMessages";
import { prisma } from "src/database/prisma";
import { UpdateEmployee } from "src/interfaces/user.interface";

export class UserController {
    static async getAll (req: FastifyRequest, res: FastifyReply): Promise<void>{
        try {
            const employees = await prisma.employee.findMany();

            res.send(employees);
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async getById (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply): Promise<void> {
        try {
            const employeeId = req.params.id;

            const employee = await prisma.employee.findUnique({
                where: {
                    id: employeeId
                }
            });

            if (employee)
                res.send(employee);
            else
                res.status(404).send(error404("Usuário"));
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async update (req: FastifyRequest<{Body: UpdateEmployee, Params: {id: string}}>, res: FastifyReply): Promise<void> {
        try {
            const employeeBody = req.body;
            const id = req.params.id;

            console.log(employeeBody);
            console.log(id);

            const employee = await prisma.employee.update(
                { 
                    data: employeeBody, 
                    where: {
                        id
                    }
                }
            );

            console.log(employee);

            res.send(employee);
        } catch (error) {
            console.error(error);
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }

    static async delete (req: FastifyRequest<{Params: {id: string}}>, res: FastifyReply): Promise<void> {
        try {
            const id = req.params.id;

            await prisma.employee.delete({
                where: {
                    id
                }
            });

            res.send({ message: "Usuário deletado com sucesso!"});
        } catch (error) {
            if (error instanceof Error)
                res.status(500).send({ name: error.name, type: error.message});
        }
    }
}