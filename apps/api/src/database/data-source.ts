import { DataSource } from "typeorm";
import { entities } from "./entities";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgres://hishab:hishab@localhost:5432/hishab",
  entities,
  migrations: ["dist/database/migrations/*.js"],
  logging: false,
  synchronize: false,
  migrationsRun: false,
  subscribers: [],
});
