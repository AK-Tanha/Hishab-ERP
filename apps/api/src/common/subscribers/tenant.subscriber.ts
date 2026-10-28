import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { BaseEntity } from "../../database/base.entity";

@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  listenTo() {
    return BaseEntity;
  }

  beforeInsert(event: InsertEvent<any>) {
    if (event.entity && (event.entity as any).tenantId && !(event.entity as any).tenant_id) {
      (event.entity as any).tenant_id = (event.entity as any).tenantId;
    }
  }

  beforeUpdate(event: UpdateEvent<any>) {
    if (event.entity && (event.entity as any).tenantId && !(event.entity as any).tenant_id) {
      (event.entity as any).tenant_id = (event.entity as any).tenantId;
    }
  }
}
