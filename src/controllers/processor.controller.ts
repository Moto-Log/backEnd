/* eslint-disable no-mixed-spaces-and-tabs */
import { FastifyReply, FastifyRequest } from "fastify";
import { GENERIC_CATCH, message } from "src/constants/messages";
import { DEFAULT_ROLES } from "src/constants/roles";
import { Weight } from "src/constants/weights";
import { prisma } from "src/database/prisma";
import { IDetailedSubject } from "src/interfaces/subjects.interface";
import { ISysConfigProcessor } from "src/interfaces/sysconfigs.interface";
import { IUserQueue, IUserToProcess, IUserToProcessFormatted } from "src/interfaces/user.interface";
import { SubjectController } from "./subject.controller";

async function getUsersRelation(): Promise<IUserToProcess[]> {
    try {
        const usersRegisters: IUserToProcess[] = await prisma.$queryRaw`
			SELECT e.id, p.type, p.value, (
				SELECT SUM(cs.chs)
				FROM "courseSubject" AS cs
				WHERE e.id = cs."employeeId"
			) AS chs, (
				SELECT r.chs
				FROM role AS r
				WHERE r.id = e."roleId"
			) AS max_chs
			FROM employee AS e
			LEFT JOIN preferences AS p
				ON e.id = p."employeeId"
		`;

        return usersRegisters;
    } catch (err) {
        message("error", GENERIC_CATCH, err);
    }
}

function applyFilterAndExceptions(usersRegisters: IUserToProcess[]): IUserToProcessFormatted[] {
    const users: IUserToProcessFormatted[] = [];

    usersRegisters.map(userRegister => {
        const { id, chs, max_chs } = userRegister;

        // Condições para o registro não ser adicionado na fila
        if (
            users.find(user => user.id === id) || // A fila já conter o registro
			Number(max_chs) === 0 || // Admins tem CHS 0, então não entram na fila
			Number(chs) !== 0 && Number(chs) === Number(max_chs) // Já ter atingido o máximo de CHS
        ) return;

        const findUser = usersRegisters.filter(user => user.id === id);
        const preferences = findUser.map(data => {
            const { type, value } = data;
            return (type && value) ? { type, value } : null;
        }).filter(value => value != null);

        users.push({
            id: userRegister.id,
            preferences,
            chs: Number(chs),
            max_chs: Number(max_chs)
        });
    });

    return users;
}

function createQueue(subject: IDetailedSubject, users: IUserToProcessFormatted[], sysconfigs: ISysConfigProcessor): IUserQueue[] {
    const queue = users.map(user => {
        const { id, chs, max_chs, preferences } = user;

        let subject_affinity = false;
        let weight = 0;

        // Recebe os pesos como parametro do registro no banco, caso venham vazios ou strings não-númericas, serão usados os valores
        // do arquivo src/constants/weights.ts
        const SUBJECT_INCIDENCE = Number(sysconfigs.SUBJECT_INCIDENCE) || Weight.SUBJECT_INCIDENCE;
        const COMMON_INCIDENCE = Number(sysconfigs.COMMON_INCIDENCE) || Weight.COMMON_INCIDENCE;
        const CHS_DIFF_ROLE_FACTOR = Number(sysconfigs.CHS_DIFF_ROLE_FACTOR) || Weight.CHS_DIFF_ROLE_FACTOR;
        const CHS_DIFF_LEVEL_IMPORTANCE_FACTOR = Number(sysconfigs.CHS_DIFF_LEVEL_IMPORTANCE_FACTOR) || Weight.CHS_DIFF_LEVEL_IMPORTANCE_FACTOR;

        // Definição das regras de peso por preferencias
        preferences.map(preference => {
            if (preference.type == "subject") {
                if (subject.name == preference.value) {
                    weight += SUBJECT_INCIDENCE;
                    subject_affinity = true;
                }
            } else {
                if (subject[preference.type] == preference.value)
                    weight += COMMON_INCIDENCE;
            }
        });

        // Definição de peso por CHS não preenchidas
        const findRole = DEFAULT_ROLES.filter(role => role.chs === max_chs);

        // Caso seja coordenador, terá um peso a mais, pois tem menos CHS para preencher
        // No momento que está sendo feito a proporção é de 16:10 (DOCENTE:COORDENADOR)
        if (findRole.length > 0 && findRole[0].name === "COORDENADOR")
            weight += (((max_chs - chs) * CHS_DIFF_ROLE_FACTOR) / 10) * CHS_DIFF_LEVEL_IMPORTANCE_FACTOR;
        else
            weight += ((max_chs - chs) / 10) * CHS_DIFF_LEVEL_IMPORTANCE_FACTOR;

        return { id, weight, chs, max_chs, subject_affinity };
    });

    // Cria uma fila apenas com os usuários que tem afinidade com aquela disciplina,
    // com exceção daqueles que não tem CHS disponível para pegá-la
    const affinity_users = queue.filter(user => 
        user.subject_affinity === true &&
		(user.chs + subject.chs) <= subject.chs
    );

    return (affinity_users.length > 0) ? affinity_users : queue;
}

async function linkUserToSubject(subjectId: string, employeeId: string) {
    try {
        await prisma.courseSubject.update({
            where: { id: subjectId },
            data: { employeeId: employeeId }
        });
    } catch (err) {
        message("error", GENERIC_CATCH, err);
    }
}

function showRelation(queue: IUserQueue[], subject: IDetailedSubject, actual: number) {
    console.log("==================");
    console.log("[ FILA ]");
    console.log(queue.map(q => `${q.id} | ${q.weight}` ));
    console.log("==================");

    console.log(`Usuário ID: ${queue[actual].id}`);
    console.log(`Disciplina "${subject.name}" atribuída (CHS: ${subject.chs})`);
    console.log(`CHS Atual: ${queue[actual].chs}`);
    console.log(`CHS Máxima: ${queue[actual].max_chs}`);
    console.log("-------------------------------------");
}

async function subjectsAssignment(): Promise<void> {
    const subjects = (await SubjectController.internalGetAllDetailed({}));
    const sysConfigsList = await prisma.sysconfig.findMany({ where: { type: "PROCESSOR" }});
    
    const sysConfigObject = {
        SUBJECT_INCIDENCE: null,
        COMMON_INCIDENCE: null,
        CHS_DIFF_ROLE_FACTOR: null,
        CHS_DIFF_LEVEL_IMPORTANCE_FACTOR: null,
    };

    sysConfigsList.map(sysconfig => Object.assign(sysConfigObject, { [sysconfig.name]: sysconfig.value }));

    const subjects_not_assigned = [];
    for (const subject of subjects) {
	    const usersRegisters = await getUsersRelation();
	    const users = applyFilterAndExceptions(usersRegisters);

	    // Criação da fila
	    const queue = createQueue(subject, users, sysConfigObject);

	    // Quando a fila zerar, significa que todos atingiram a máxima CHS
	    if (queue.length > 0) {
	        queue.sort((userA, userB) => userB.weight - userA.weight);

	        for (let actual = 0; actual < queue.length; actual++) {
	            if (queue[actual].chs + subject.chs <= queue[actual].max_chs) {
	                await linkUserToSubject(subject.id, queue[actual].id);

	                // Mostra as atribuições com alguns detalhes no console
	                showRelation(queue, subject, actual);

	                break;
	            }
	        }
	    } else {
	        subjects_not_assigned.push(subject);
	    }
    }
}

export class ProcessorController {
    static async runTask(request: FastifyRequest, response: FastifyReply): Promise<void> {
        try {
            await subjectsAssignment();

            return response.send({ message: "Operação concluída com sucesso!" });
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }

    static async clearDistribution(request: FastifyRequest, response: FastifyReply): Promise<void> {
        try {
            const { count } = await prisma.courseSubject.updateMany({
                where: { employeeId: { not: null } },
                data: { employeeId: null }
            });

            return response.send({ message: `Operação concluída com sucesso! ${count} registros foram desvinculados!` });
        } catch (error) {
            if (error instanceof Error)
                return response
                    .status(500)
                    .send({ name: error.name, type: error.message});
        }
    }
}