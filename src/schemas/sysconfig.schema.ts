import { z } from "zod";

export const SysConfigSchema = z.object({
    name: z.string().min(1).max(255),
    type: z.string().min(1).max(255),
    value: z.string().min(1).max(255)
});