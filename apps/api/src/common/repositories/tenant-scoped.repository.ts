import { Repository, ObjectLiteral } from "typeorm";
import { ClsService } from "nestjs-cls";
import { ForbiddenException } from "@nestjs/common";

export class TenantScopedRepository<T extends ObjectLiteral> extends Repository<T> {
  constructor(private cls: ClsService, target: any, dataSource: any) {
    super(target, dataSource.createEntityManager());
  }

  getTenantId(): string {
    const tenantId = this.cls.get("tenantId") || (this as any).tenantId;
    if (!tenantId) {
      throw new ForbiddenException("Tenant context is missing");
    }
    return tenantId;
  }

  createQueryBuilder(alias?: string) {
    const qb = super.createQueryBuilder(alias);
    const tenantId = this.getTenantId();
    const tableName = alias || this.metadata.tableName;
    qb.andWhere(`${tableName}.tenant_id = :tenantId`, { tenantId });
    return qb;
  }

  async find(options?: any) {
    const tenantId = this.getTenantId();
    const opts = options || {};
    opts.where = { ...(opts.where || {}), tenantId };
    return super.find(opts);
  }

  async findOne(options?: any) {
    const tenantId = this.getTenantId();
    const opts = options || {};
    opts.where = { ...(opts.where || {}), tenantId };
    return super.findOne(opts);
  }

  async count(options?: any) {
    const tenantId = this.getTenantId();
    const opts = options || {};
    opts.where = { ...(opts.where || {}), tenantId };
    return super.count(opts);
  }
}
