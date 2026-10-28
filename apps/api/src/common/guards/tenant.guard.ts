import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { TenantId } from "../decorators/tenant-id.decorator";

import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/auth.decorators";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers["x-tenant-id"] as string;
    if (tenantId) {
      request.tenantId = tenantId;
      return true;
    }
    if (isPublic) {
      return true;
    }
    throw new ForbiddenException("X-Tenant-ID header is required");
  }
}
