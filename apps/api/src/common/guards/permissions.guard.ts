import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/auth.decorators";
import { ROLE_PERMISSIONS } from "@hishab/shared";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permissions || permissions.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as any;
    const userPermissions: string[] = user?.permissions ?? [];

    const hasPermission = permissions.some((p) => {
      if (userPermissions.includes("*")) return true;
      if (userPermissions.includes(p)) return true;
      const wildcard = p.replace(/\.\*$/, ".*");
      return userPermissions.some((up) => new RegExp(`^${up.replace(/\./g, "\\.")}$`).test(p));
    });

    if (!hasPermission) {
      throw new ForbiddenException("Insufficient permissions");
    }
    return true;
  }
}
