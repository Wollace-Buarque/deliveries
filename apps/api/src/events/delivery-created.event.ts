import { DomainEvent } from '@deliveries/shared';

export class DeliveryCreatedEvent implements DomainEvent {
  public readonly id: string;
  public readonly type: string;
  public readonly aggregateId: string;
  public readonly data: any;
  public readonly timestamp: Date;
  public readonly version: number;

  constructor(
    public readonly deliveryId: string,
    public readonly clientId: string,
    public readonly description: string,
    public readonly value: number
  ) {
    this.id = `delivery-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.type = 'DELIVERY_CREATED';
    this.aggregateId = deliveryId;
    this.data = {
      deliveryId,
      clientId,
      description,
      value,
    };
    this.timestamp = new Date();
    this.version = 1;
  }
}
