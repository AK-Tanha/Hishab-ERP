import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/entities/user.entity";
import { IsNull } from "typeorm";
import { LoginInput, RegisterTenantInput } from "@hishab/shared";
import * as bcrypt from "bcryptjs";
import { UsersService } from "../users/users.service";
import { TenantsService } from "../tenants/tenants.service";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
    private usersService: UsersService,
    private tenantsService: TenantsService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email, deletedAt: IsNull() } });
    if (!user || !user.isActive) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    return user;
  }

  async login(input: LoginInput, tenantId?: string): Promise<{ user: User; tokens: TokenPair }> {
    let resolvedTenantId = tenantId;
    if (!resolvedTenantId && input.tenantSubdomain) {
      const tenant = await this.tenantsService.findBySubdomain(input.tenantSubdomain);
      resolvedTenantId = tenant.id;
    }

    const user = await this.validateUser(input.email, input.password);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }
    if (resolvedTenantId && user.tenantId !== resolvedTenantId) {
      throw new UnauthorizedException("User does not belong to this tenant");
    }

    const { roles, permissions } = await this.usersService.getUserRolesAndPermissions(user.id);
    const payload = { sub: user.id, email: user.email, nameEn: user.nameEn, tenantId: user.tenantId, roles, permissions };
    const accessToken = this.jwtService.sign(payload, { expiresIn: this.config.get<string>("jwt.accessExpiresIn") as any });
    const refreshToken = this.jwtService.sign(payload, { secret: this.config.get<string>("jwt.refreshSecret"), expiresIn: this.config.get<string>("jwt.refreshExpiresIn") as any });

    return { user, tokens: { accessToken, refreshToken } };
  }

  async register(input: RegisterTenantInput) {
    const existing = await this.userRepo.findOne({ where: { email: input.ownerEmail, deletedAt: IsNull() } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }
    return this.tenantsService.register(input);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get<string>("jwt.refreshSecret"),
      });
      const accessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
        nameEn: payload.nameEn,
        tenantId: payload.tenantId,
        roles: payload.roles,
        permissions: payload.permissions,
      });
      return { accessToken };
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async logout(_userId: string) {
    // Refresh token revocation would be handled with a token store; placeholder for now
    return { success: true };
  }
}
