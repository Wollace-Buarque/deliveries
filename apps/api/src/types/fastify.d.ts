import { FastifyInstance } from 'fastify';
import { UserService } from '../services/user.service';
import { DeliveryService } from '../services/delivery.service';
import { EventBus } from '../events/event-bus';

declare module 'fastify' {
  interface FastifyInstance {
    userService: UserService;
    deliveryService: DeliveryService;
    eventBus: EventBus;
  }
}
