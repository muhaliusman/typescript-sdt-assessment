import { DataSource } from "typeorm";
import { env } from "../env";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/database/migrations/*.js"],
});
