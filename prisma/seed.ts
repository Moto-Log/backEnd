import { TRoles } from "src/interfaces/roles.interface";
import { GENERIC_CATCH, message } from "../src/constants/messages";
import { DEFAULT_ROLES } from "../src/constants/roles";
import { prisma } from "../src/database/prisma";

async function generateData(num: number, role: TRoles) {
    const reg = (role === "DOCENTE") ? 10000000000 - num : num * 10;

    const roleId = (await prisma.role.findUnique({ where: { name: role }})).id;

    return {
        registration: reg.toString(),
        name: `${role} ${num}`,
        email: `professor${num}@ifro.edu.br`,
        password: reg.toString(),
        roleId,
    };
}

async function createTestUsers() {
    try {
        const QTD_DOCENTE = 8;
        const QTD_COORDENADOR = 4;

        const _docente_test_users = [];
        const _coordenador_test_users = [];

        for (let i=1; i<=QTD_DOCENTE; i++) _docente_test_users.push(await generateData(i, "DOCENTE"));
        for (let i=1; i<=QTD_COORDENADOR; i++) _coordenador_test_users.push(await generateData(i, "COORDENADOR"));

        await prisma.employee.createMany({ data: _docente_test_users });
        await prisma.employee.createMany({ data: _coordenador_test_users });
    } catch (err) {
        console.error(err);
    }
}

async function createDefaultRoles() {
    try {
        // Cria os cargos padrões
        for (const role of DEFAULT_ROLES) {
            const findRole = await prisma.role.findUnique({ where: { name: role.name } });

            if (!findRole) await prisma.role.create({ data: role });
        }
    } catch (err) {
        message("error", GENERIC_CATCH, err);
    }
}

async function createDefaultUser() {
    try {
        const DEFAULT_USER = {
            name: "Web Wizard",
            registration: "0",
            email: "webwizardsads@gmail.com",
            password: "",
            role: "ADMIN"
        };

        // Cria o usuário padrão
        const findDefaultUser = await prisma.employee.findUnique({ where: { registration: DEFAULT_USER.registration } });

        if (!findDefaultUser) {
            const roleDefaultUser = await prisma.role.findUnique({ where: { name: DEFAULT_USER.role } });

            if (roleDefaultUser) {
                delete DEFAULT_USER["role"];
                await prisma.employee.create({ data: { ...DEFAULT_USER, role: { connect: { id: roleDefaultUser.id } } } });
            }
        }
    } catch (err) {
        message("error", GENERIC_CATCH, err);
    }
}

async function main() {
    await createDefaultRoles();
    await createDefaultUser();
    await createTestUsers();

    message("success", "Padrões de banco aplicados com sucesso!");
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });