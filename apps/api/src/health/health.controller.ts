import { Controller, Get, Version, VERSION_NEUTRAL } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { AppDataSource } from "../database/data-source";

@Controller("health")
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @Version(VERSION_NEUTRAL)
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        try {
          if (AppDataSource.isInitialized) {
            await AppDataSource.query("SELECT 1");
          }
          return { database: { status: "up" } };
        } catch {
          return { database: { status: "down", message: "unreachable" } };
        }
      },
    ]);
  }
}