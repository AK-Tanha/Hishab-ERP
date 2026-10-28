import { TenantGuard } from "./tenant.guard";
import { Reflector } from "@nestjs/core";
import { ClsService } from "nestjs-cls";
import { ForbiddenException } from "@nestjs/common";

describe("Tenant isolation", () => {
  let guard: TenantGuard;
  let reflector: Reflector;
  let cls: ClsService;

  beforeEach(() => {
    reflector = new Reflector();
    cls = {
      set: jest.fn(),
      get: jest.fn(),
    } as any;
    guard = new TenantGuard(reflector, cls);
  });

  it("should never allow user A to access tenant B data via header spoofing when JWT has different tenant", () => {
    const mockContext: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { "x-tenant-id": "tenant-b" },
          user: { tenantId: "tenant-a", sub: "user-a" },
        }),
      }),
    };

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockContext.switchToHttp().getRequest().tenantId).toBe("tenant-a");
    expect(cls.set).toHaveBeenCalledWith("tenantId", "tenant-a");
  });

  it("should prevent cross-tenant access - user from tenant A cannot be assigned tenant B", () => {
    const request: any = {
      headers: { "x-tenant-id": "tenant-b" },
      user: { tenantId: "tenant-a" },
    };
    const mockContext: any = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => request }),
    };

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);
    guard.canActivate(mockContext);
    expect(request.tenantId).not.toBe("tenant-b");
    expect(request.tenantId).toBe("tenant-a");
  });
});
