import { registerAs } from "@nestjs/config";

export const appConfig = registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001", 10),
  apiUrl: process.env.API_URL || "http://localhost:3001",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
}));

export const databaseConfig = registerAs("database", () => ({
  url: process.env.DATABASE_URL || process.env.POSTGRES_URL || "postgres://hishab:hishab@localhost:5432/hishab",
  logging: process.env.DB_LOGGING === "true",
  synchronize: process.env.DB_SYNCHRONIZE === "true",
  migrationsRun: process.env.DB_MIGRATIONS_RUN === "true",
}));

export const redisConfig = registerAs("redis", () => ({
  url: process.env.REDIS_URL || "redis://localhost:6379",
}));

export const jwtConfig = registerAs("jwt", () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret-change-me",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret-change-me",
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
}));

export const mailConfig = registerAs("mail", () => ({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025", 10),
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || "Hishab ERP <noreply@hishab.local>",
}));
