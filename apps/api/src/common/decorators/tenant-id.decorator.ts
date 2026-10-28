import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const TenantId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  return request.tenantId;
});

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): any => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  if (!data) return user;
  return (user as any)[data as string];
});
