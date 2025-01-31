import * as dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config(); // default for dev and prod
}

const envSchema = z.object({
  APP_PORT: z
    .string()
    .regex(/^\d+$/, { message: "APP_PORT must be a number" })
    .transform(Number)
    .default("3000"),
  DB_HOST: z.string().nonempty(),
  DB_PORT: z
    .string()
    .regex(/^\d+$/, { message: "DB_PORT must be a number" })
    .transform(Number)
    .default("3306"),
  DB_USER: z.string().nonempty(),
  DB_PASSWORD: z.string().nonempty(),
  DB_NAME: z.string().nonempty(),
});

export const env = envSchema.parse(process.env);
