import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthGuard } from "./guards/auth.guard";
import { TenantGuard } from "./guards/tenant.guard";
import { RolesGuard } from "./guards/roles.guard";
import { PermissionsGuard } from "./guards/permissions.guard";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwt.accessSecret"),
        signOptions: { expiresIn: config.get<string>("jwt.accessExpiresIn") as any },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthGuard, TenantGuard, RolesGuard, PermissionsGuard],
  exports: [AuthGuard, TenantGuard, RolesGuard, PermissionsGuard, JwtModule],
})
export class CommonModule {}
