import { EventHandler } from '../event-bus'
import { UserCreatedEvent } from '../user-created.event'
import { DeliveryCreatedEvent } from '../delivery-created.event'
import { DeliveryAcceptedEvent } from '../delivery-accepted.event'
import { DeliveryStatusChangedEvent } from '../delivery-status-changed.event'

export class NotificationHandler implements EventHandler<any> {
  async handle(event: any): Promise<void> {
    switch (event.type) {
      case 'USER_CREATED':
        await this.handleUserCreated(event as UserCreatedEvent)
        break
      case 'DELIVERY_CREATED':
        await this.handleDeliveryCreated(event as DeliveryCreatedEvent)
        break
      case 'DELIVERY_ACCEPTED':
        await this.handleDeliveryAccepted(event as DeliveryAcceptedEvent)
        break
      case 'DELIVERY_STATUS_CHANGED':
        await this.handleDeliveryStatusChanged(event as DeliveryStatusChangedEvent)
        break
      default:
        console.log(`No handler for event type: ${event.type}`)
    }
  }

  private async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    console.log(`Sending welcome email to ${event.email}`)
    // TODO: Implement email sending logic
    // await this.emailService.sendWelcomeEmail(event.email, event.role);
  }

  private async handleDeliveryCreated(event: DeliveryCreatedEvent): Promise<void> {
    console.log(`Notifying delivery persons about new delivery: ${event.deliveryId}`)
    // TODO: Implement push notification to available delivery persons
    // await this.notificationService.notifyAvailableDeliveryPersons(event.deliveryId);
  }

  private async handleDeliveryAccepted(event: DeliveryAcceptedEvent): Promise<void> {
    console.log(`Notifying client about accepted delivery: ${event.deliveryId}`)
    // TODO: Implement notification to client
    // await this.notificationService.notifyClientDeliveryAccepted(event.clientId, event.deliveryId);
  }

  private async handleDeliveryStatusChanged(event: DeliveryStatusChangedEvent): Promise<void> {
    console.log(`Delivery ${event.deliveryId} status changed from ${event.oldStatus} to ${event.newStatus}`)
    // TODO: Implement status change notifications
    // await this.notificationService.notifyStatusChange(event.deliveryId, event.oldStatus, event.newStatus);
  }
}
