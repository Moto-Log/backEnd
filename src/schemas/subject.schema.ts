import { z } from "zod";

export const SubjectSchema = z.object({
    subarea: z.string().uuid(),
    course: z.string().uuid(),
    period: z.number().gt(0),
    name: z.string().min(3).max(255),
    chs: z.number().gt(0)
});