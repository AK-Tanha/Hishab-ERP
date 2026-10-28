import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || "postgres://hishab:hishab@localhost:5432/hishab",
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/database/migrations/*.js"],
  logging: false,
  synchronize: false,
  migrationsRun: false,
  subscribers: [],
});
