import { readFile, utils } from "xlsx";
import { prisma } from "./prisma";

/**
 * Base Object
 * 
 * {
 *   AREA: 'INFORMÁTICA',
 *   DISCIPLINA: 'Práticas Integradoras',
 *   PERIODO: '2º Ano',
 *   Curso: 'Informática B',
 *   MODALIDADE: 'INTEGRADO',
 *   TURNO: 'Vespertino',
 *   CH SEM: 1
 * }
 * 
 * Query Consulta:
 * 		SELECT cs.id, cs.period, cs.chs, c.name AS course, s.name AS subject, c.modality
 * 		FROM "courseSubject" AS cs
 * 		JOIN subject as s
 * 			ON s.id=cs."subjectId"
 * 		JOIN course as c
 * 			ON c.id=cs."courseId"
 * 		WHERE c.name = 'ADS'
 * 		LIMIT 20;
 */

interface ISheet {
	area: string,
	disciplina: string,
	periodo: number,
	curso: string,
	modalidade: string,
	turno: string,
	chs: number
}

interface ISubject {
	name: string,
}

interface IArea {
	name: string,
}

interface ICourse {
	name: string,
	shift: string,
	modality: string,
}

interface ICourseSubject {
	course: string,
	subject: string,
	period: number,
	chs: number,
}

// "src/database/disciplinas.xlsx"
function read_xlsx(path: string): ISheet[] {
    const file = readFile(path);
    const sheets = file.SheetNames;
	
    for (const sheet of sheets) {
        const temp = utils.sheet_to_json(file.Sheets[sheet]);
        const formatted_sheets: ISheet[] = [];

        temp.map(async (sheet) => {
            if (Object.keys(sheet).length == 8) {
                const x_sheet: ISheet = {
                    area: sheet["ÁREA"].toUpperCase(),
                    disciplina: sheet["DISCIPLINA"].toUpperCase(),
                    periodo: parseInt(sheet["Ano/Período"].replace(/\D/g, "")),
                    curso: sheet["Curso"].toUpperCase(),
                    modalidade: sheet["MODALIDADE"].toUpperCase().at(0),
                    turno: sheet["TURNO"].toUpperCase().at(0),
                    chs: parseInt(sheet["CH SEM"])
                };

                formatted_sheets.push(x_sheet);
            }
        });

        return formatted_sheets;
    }
}

function getIndividualObjects(): {
	areas: IArea[],
	subjects: ISubject[],
	courses: ICourse[],
	coursesSubjects: ICourseSubject[]
	} {
    try {
        const sheets = read_xlsx("src/database/disciplinas.xlsx");

        const areas: IArea[] = [];
        const subjects: ISubject[] = [];
        const courses: ICourse[] =  [];
        const coursesSubjects: ICourseSubject[] = [];

        sheets.map(sheet => {
            if (!areas.find(area => area.name == sheet.area))
                areas.push({
                    name: sheet.area
                });
				
            if (!subjects.find(subject => subject.name == sheet.disciplina))
                subjects.push({
                    name: sheet.disciplina
                });
			
            if (!courses.find(course => course.name == sheet.curso))
                courses.push({
                    name: sheet.curso,
                    modality: sheet.modalidade,
                    shift: sheet.turno,
                });
		
            if (!coursesSubjects.find(courseSubject => (
                courseSubject.course == sheet.curso &&
				courseSubject.subject == sheet.disciplina &&
				courseSubject.chs == sheet.chs &&
				courseSubject.period == sheet.periodo
            )))
                coursesSubjects.push({
                    course: sheet.curso,
                    subject: sheet.disciplina,
                    chs: sheet.chs,
                    period: sheet.periodo
                });
        });

        return {
            areas,
            subjects,
            courses,
            coursesSubjects
        };
    } catch (err) {
        console.error(err);
    }
}

async function migrate(): Promise<void> {
    const { areas, subjects, courses, coursesSubjects } = getIndividualObjects();

    try {

        await prisma.area.createMany({ data: areas });
        await prisma.subject.createMany({ data: subjects });
        await prisma.course.createMany({ data: courses });
        
        coursesSubjects.map(async (courseSubject) => {
            const subjectRegister = await prisma.subject.findUnique({
                where: { name: courseSubject.subject },
                select: { id: true }
            });

            const courseRegister = await prisma.course.findUnique({
                where: { name: courseSubject.course },
                select: { id: true }
            });

            if (subjectRegister && courseRegister) {
                const subjectId = subjectRegister.id;
                const courseId = courseRegister.id;

                await prisma.courseSubject.create({ data: {
                    ...courseSubject,
                    subject: { connect: { id: subjectId } },
                    course: { connect: { id: courseId } },
                }});
            }
        });

    } catch (err) {
        console.error(err);
    }

}

migrate();