import { DomainEvent } from '@deliveries/shared';

export abstract class EventHandler<T extends DomainEvent> {
  abstract handle(event: T): Promise<void>;
}

export class EventBus {
  private handlers = new Map<string, EventHandler<any>[]>();

  register<T extends DomainEvent>(
    eventType: string,
    handler: EventHandler<T>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async emit<T extends DomainEvent>(event: T): Promise<void> {
    const eventType = event.type;
    const handlers = this.handlers.get(eventType) || [];

    // Execute all handlers in parallel
    await Promise.all(
      handlers.map(handler => this.executeHandler(handler, event))
    );
  }

  private async executeHandler<T extends DomainEvent>(
    handler: EventHandler<T>,
    event: T
  ): Promise<void> {
    try {
      await handler.handle(event);
    } catch (error) {
      console.error(`Error handling event ${event.type}:`, error);
      // In a real application, you might want to retry or send to a dead letter queue
    }
  }

  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.length || 0;
  }

  getAllEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}
