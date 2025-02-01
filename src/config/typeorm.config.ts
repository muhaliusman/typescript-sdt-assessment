import { DataSource } from "typeorm";
import { env } from "../env";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities:
    env.NODE_ENV === "production"
      ? ["dist/**/*.entity.js"]
      : ["src/**/*.entity.ts"],
  migrations:
    env.NODE_ENV === "production"
      ? ["dist/database/migrations/*.js"]
      : ["src/database/migrations/*.ts"],
});
