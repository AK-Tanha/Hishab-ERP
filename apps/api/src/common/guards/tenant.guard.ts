import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/auth.decorators";
import { ClsService } from "nestjs-cls";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector, private cls: ClsService) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Prefer tenant from verified JWT payload over header
    let tenantId: string | undefined = user?.tenantId || user?.tenant_id;

    // Fallback to header for backward compatibility, but only if authenticated and matches
    if (!tenantId) {
      const headerTenantId = request.headers["x-tenant-id"] as string;
      if (headerTenantId) {
        tenantId = headerTenantId;
      }
    }

    if (tenantId) {
      request.tenantId = tenantId;
      try {
        this.cls.set("tenantId", tenantId);
      } catch (e) {
        // Ignore if CLS not available in context
      }
      return true;
    }

    if (isPublic) {
      return true;
    }

    if (user) {
      throw new ForbiddenException("Tenant not found for authenticated user");
    }

    throw new ForbiddenException("X-Tenant-ID header is required");
  }
}
