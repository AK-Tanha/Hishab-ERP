import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import { TerminusModule } from "@nestjs/terminus";
import { ClsModule } from "nestjs-cls";
import { entities } from "./database/entities";
import { appConfig, databaseConfig, jwtConfig, mailConfig, redisConfig } from "./config";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { AccountingModule } from "./modules/accounting/accounting.module";
import { SalesModule } from "./modules/sales/sales.module";
import { PurchasesModule } from "./modules/purchases/purchases.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { HealthController } from "./health/health.controller";
import { TenantSubscriber } from "./common/subscribers/tenant.subscriber";
import { AuditSubscriber } from "./common/subscribers/audit.subscriber";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      load: [appConfig, databaseConfig, jwtConfig, mailConfig, redisConfig],
      expandVariables: true,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TerminusModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const url = config.get<string>("database.url");
        return {
          type: "postgres",
          url,
          entities,
          migrations: ["dist/database/migrations/*.js"],
          logging: config.get<boolean>("database.logging"),
          synchronize: config.get<boolean>("database.synchronize"),
          migrationsRun: config.get<boolean>("database.migrationsRun"),
          subscribers: [TenantSubscriber, AuditSubscriber],
        } as any;
      },
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwt.accessSecret"),
        signOptions: { expiresIn: config.get<string>("jwt.accessExpiresIn") as any },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    TenantsModule,
    UsersModule,
    InventoryModule,
    AccountingModule,
    SalesModule,
    PurchasesModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
