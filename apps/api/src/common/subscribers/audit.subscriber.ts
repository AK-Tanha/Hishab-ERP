import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
} from "typeorm";
import { BaseEntity } from "../../database/base.entity";

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  listenTo() {
    return BaseEntity;
  }

  afterInsert(event: InsertEvent<any>) {
    this.log(event.entity, "create");
  }

  afterUpdate(event: UpdateEvent<any>) {
    this.log(event.entity, "update");
  }

  afterRemove(event: RemoveEvent<any>) {
    this.log(event.entity, "delete");
  }

  private log(entity: any, action: string) {
    if (!entity || !entity.id) return;
     
    console.log(`[AUDIT] ${action} ${entity.constructor?.name} id=${entity.id} tenant_id=${entity.tenant_id}`);
  }
}
