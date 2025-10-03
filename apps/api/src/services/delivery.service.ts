import { DeliveryRepository, DeliveryWithDetails } from '../repositories/delivery.repository'
import { BaseService } from './base.service'
import { CreateDeliveryDto, DeliveryStatus, UpdateDeliveryDto } from '@deliveries/shared'
import { EventBus } from '../events/event-bus'
import { DeliveryCreatedEvent } from '../events/delivery-created.event'
import { DeliveryAcceptedEvent } from '../events/delivery-accepted.event'
import { DeliveryStatusChangedEvent } from '../events/delivery-status-changed.event'
import { calculateDistance, calculateEstimatedTime } from '@deliveries/shared'

export class DeliveryService extends BaseService<DeliveryWithDetails, CreateDeliveryDto, UpdateDeliveryDto> {
  constructor(
    private deliveryRepository: DeliveryRepository,
    private eventBus: EventBus
  ) {
    super(deliveryRepository)
  }

  async create(data: CreateDeliveryDto): Promise<DeliveryWithDetails> {
    const distance = calculateDistance(
      data.origin.coordinates.lat,
      data.origin.coordinates.lng,
      data.destination.coordinates.lat,
      data.destination.coordinates.lng
    )

    const estimatedTime = calculateEstimatedTime(distance)

    const delivery = await this.deliveryRepository.create({
      ...data,
      estimatedTime
    })

    await this.eventBus.emit(
      new DeliveryCreatedEvent(delivery.id, delivery.clientId, delivery.description, delivery.value)
    )

    return delivery
  }

  async acceptDelivery(deliveryId: string, deliveryPersonId: string): Promise<DeliveryWithDetails> {
    const delivery = await this.deliveryRepository.acceptDelivery(deliveryId, deliveryPersonId)

    await this.eventBus.emit(new DeliveryAcceptedEvent(delivery.id, deliveryPersonId, delivery.clientId))

    return delivery
  }

  async updateStatus(
    deliveryId: string,
    status: string,
    changedBy: string,
    actualTime?: number
  ): Promise<DeliveryWithDetails> {
    const oldDelivery = await this.deliveryRepository.findById(deliveryId)
    if (!oldDelivery) {
      throw new Error('Delivery not found')
    }

    const delivery = await this.deliveryRepository.updateStatus(deliveryId, status as any, actualTime)

    // Emit status changed event
    await this.eventBus.emit(
      new DeliveryStatusChangedEvent(delivery.id, oldDelivery.status, delivery.status, changedBy)
    )

    return delivery
  }

  async getDeliveriesByClient(
    clientId: string,
    page = 1,
    limit = 10,
    status?: DeliveryStatus
  ): Promise<{
    deliveries: DeliveryWithDetails[]
    total: number
  }> {
    const [deliveries, total] = await Promise.all([
      this.deliveryRepository.findMany({ clientId, page, limit, status }),
      this.deliveryRepository.count({ clientId, status })
    ])

    return { deliveries, total }
  }

  async getDeliveriesByDeliveryPerson(
    deliveryPersonId: string,
    page = 1,
    limit = 10,
    status?: DeliveryStatus
  ): Promise<{
    deliveries: DeliveryWithDetails[]
    total: number
  }> {
    const [deliveries, total] = await Promise.all([
      this.deliveryRepository.findMany({ deliveryId: deliveryPersonId, page, limit, status }),
      this.deliveryRepository.count({ deliveryId: deliveryPersonId, status })
    ])

    return { deliveries, total }
  }

  async getAvailableDeliveries(
    page = 1,
    limit = 10
  ): Promise<{
    deliveries: DeliveryWithDetails[]
    total: number
  }> {
    const [deliveries, total] = await Promise.all([
      this.deliveryRepository.findMany({ status: 'PENDING', page, limit }),
      this.deliveryRepository.count({ status: 'PENDING' })
    ])

    return { deliveries, total }
  }

  async getDeliveriesByStatus(
    status: string,
    page = 1,
    limit = 10
  ): Promise<{
    deliveries: DeliveryWithDetails[]
    total: number
  }> {
    const [deliveries, total] = await Promise.all([
      this.deliveryRepository.findMany({ status: status as any, page, limit }),
      this.deliveryRepository.count({ status: status as any })
    ])

    return { deliveries, total }
  }

  async getDeliveryStats(): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
    cancelled: number
  }> {
    const [total, pending, inProgress, completed, cancelled] = await Promise.all([
      this.deliveryRepository.count(),
      this.deliveryRepository.count({ status: 'PENDING' }),
      this.deliveryRepository.count({ status: 'IN_TRANSIT' }),
      this.deliveryRepository.count({ status: 'DELIVERED' }),
      this.deliveryRepository.count({ status: 'CANCELLED' })
    ])

    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled
    }
  }
}
