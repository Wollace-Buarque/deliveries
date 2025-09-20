import { DomainEvent, DeliveryStatus } from '@deliveries/shared';

export class DeliveryStatusChangedEvent implements DomainEvent {
  public readonly id: string;
  public readonly type: string;
  public readonly aggregateId: string;
  public readonly data: any;
  public readonly timestamp: Date;
  public readonly version: number;

  constructor(
    public readonly deliveryId: string,
    public readonly oldStatus: DeliveryStatus,
    public readonly newStatus: DeliveryStatus,
    public readonly changedBy: string
  ) {
    this.id = `delivery-status-changed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'DELIVERY_STATUS_CHANGED';
    this.aggregateId = deliveryId;
    this.data = {
      deliveryId,
      oldStatus,
      newStatus,
      changedBy,
    };
    this.timestamp = new Date();
    this.version = 1;
  }
}
