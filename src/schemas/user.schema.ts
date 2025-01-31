import { timezones } from "utils/timezones.util";
import { z } from "zod";

export const createOrUpdateUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  location: z.string().refine((val: string) => timezones.includes(val), {
    message:
      "Invalid timezone, please refer to this link for valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones",
  }),
  birthday: z.string().date(), // format = YYYY-MM-DD month max 12, day max 31
});
