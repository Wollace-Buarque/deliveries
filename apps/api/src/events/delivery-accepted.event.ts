import { DomainEvent } from '@deliveries/shared';

export class DeliveryAcceptedEvent implements DomainEvent {
  public readonly id: string;
  public readonly type: string;
  public readonly aggregateId: string;
  public readonly data: any;
  public readonly timestamp: Date;
  public readonly version: number;

  constructor(
    public readonly deliveryId: string,
    public readonly deliveryPersonId: string,
    public readonly clientId: string
  ) {
    this.id = `delivery-accepted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'DELIVERY_ACCEPTED';
    this.aggregateId = deliveryId;
    this.data = {
      deliveryId,
      deliveryPersonId,
      clientId,
    };
    this.timestamp = new Date();
    this.version = 1;
  }
}
