import { z } from "zod";
import { timezones } from "../utils/timezones.util";

export const createOrUpdateUserSchema = z.object({
  firstName: z.string().max(200),
  lastName: z.string().max(200),
  email: z.string().email().max(200),
  location: z.string().refine((val: string) => timezones.includes(val), {
    message:
      "Invalid timezone, please refer to this link for valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones",
  }),
  birthday: z.string().date(), // format = YYYY-MM-DD month max 12, day max 31
});

export type UserSchema = z.infer<typeof createOrUpdateUserSchema>;
