import { EPreferenceTypes } from "src/interfaces/preferences.interface";
import { z } from "zod";

export const PreferencesSchema = z.object({
    type: z.nativeEnum(EPreferenceTypes),
    value: z.string().min(1).max(255),
    employeeId: z.string().uuid(),
});