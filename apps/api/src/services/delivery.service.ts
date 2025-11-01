import { DeliveryRepository, DeliveryWithDetails } from '../repositories/delivery.repository'
import { BaseService } from './base.service'
import { CreateDeliveryDto, DeliveryStatus, UpdateDeliveryDto } from '@deliveries/shared'
import { EventBus } from '../events/event-bus'
import { DeliveryCreatedEvent } from '../events/delivery-created.event'
import { DeliveryAcceptedEvent } from '../events/delivery-accepted.event'
import { DeliveryStatusChangedEvent } from '../events/delivery-status-changed.event'
import { calculateDistance, calculateEstimatedTime } from '@deliveries/shared'
import { 
  startOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subWeeks, 
  subMonths,
  getDaysInMonth,
  getDate,
  differenceInMinutes
} from 'date-fns'

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

    let calculatedActualTime = actualTime
    if (status === 'DELIVERED' && !actualTime) {
      const now = new Date()
      const createdAt = new Date(oldDelivery.createdAt)
      calculatedActualTime = differenceInMinutes(now, createdAt)
    }

    const delivery = await this.deliveryRepository.updateStatus(deliveryId, status as any, calculatedActualTime)

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

  async getDeliveryPersonStats(deliveryPersonId: string): Promise<{
    overview: {
      totalDeliveries: number
      completedDeliveries: number
      cancelledDeliveries: number
      activeDeliveries: number
      successRate: number
    }
    earnings: {
      total: number
      today: number
      thisWeek: number
      thisMonth: number
      lastMonth: number
      projectedMonthly: number
    }
    performance: {
      averageDeliveryTime: number
      onTimeRate: number
      totalOnTime: number
      totalDelivered: number
    }
    trends: {
      deliveriesThisWeek: number
      deliveriesLastWeek: number
      weeklyGrowth: number
      deliveriesThisMonth: number
      deliveriesLastMonth: number
      monthlyGrowth: number
    }
  }> {
    const now = new Date()
    
    const todayStart = startOfDay(now)
    const weekStart = startOfWeek(now, { weekStartsOn: 0 })
    const monthStart = startOfMonth(now)
    
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))
    
    const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 })
    const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 })

    const [totalDeliveries, completedDeliveries, cancelledDeliveries, activeDeliveries] = await Promise.all([
      this.deliveryRepository.count({ deliveryId: deliveryPersonId }),
      this.deliveryRepository.count({ deliveryId: deliveryPersonId, status: 'DELIVERED' }),
      this.deliveryRepository.count({ deliveryId: deliveryPersonId, status: 'CANCELLED' }),
      Promise.all([
        this.deliveryRepository.count({ deliveryId: deliveryPersonId, status: 'ACCEPTED' }),
        this.deliveryRepository.count({ deliveryId: deliveryPersonId, status: 'PICKED_UP' }),
        this.deliveryRepository.count({ deliveryId: deliveryPersonId, status: 'IN_TRANSIT' })
      ]).then(([accepted, pickedUp, inTransit]) => accepted + pickedUp + inTransit)
    ])

    const successRate = totalDeliveries > 0 
      ? (completedDeliveries / totalDeliveries) * 100 
      : 0

    const [totalEarnings, todayEarnings, weekEarnings, monthEarnings, lastMonthEarnings] = await Promise.all([
      this.deliveryRepository.getTotalEarnings(deliveryPersonId),
      this.deliveryRepository.getTotalEarnings(deliveryPersonId, todayStart, now),
      this.deliveryRepository.getTotalEarnings(deliveryPersonId, weekStart, now),
      this.deliveryRepository.getTotalEarnings(deliveryPersonId, monthStart, now),
      this.deliveryRepository.getTotalEarnings(deliveryPersonId, lastMonthStart, lastMonthEnd)
    ])

    const daysInMonth = getDaysInMonth(now)
    const currentDay = getDate(now)
    const projectedMonthly = currentDay > 0 
      ? (monthEarnings / currentDay) * daysInMonth 
      : 0

    const averageDeliveryTime = await this.deliveryRepository.getAverageDeliveryTime(deliveryPersonId)
    const onTimeData = await this.deliveryRepository.getOnTimeDeliveryRate(deliveryPersonId)
    const onTimeRate = onTimeData.total > 0 
      ? (onTimeData.onTime / onTimeData.total) * 100 
      : 0

    const [thisWeekDeliveries, lastWeekDeliveries, thisMonthDeliveries, lastMonthDeliveries] = await Promise.all([
      (await this.deliveryRepository.getDeliveriesByPeriod(deliveryPersonId, weekStart, now)).length,
      (await this.deliveryRepository.getDeliveriesByPeriod(deliveryPersonId, lastWeekStart, lastWeekEnd)).length,
      (await this.deliveryRepository.getDeliveriesByPeriod(deliveryPersonId, monthStart, now)).length,
      (await this.deliveryRepository.getDeliveriesByPeriod(deliveryPersonId, lastMonthStart, lastMonthEnd)).length
    ])

    const weeklyGrowth = lastWeekDeliveries > 0 
      ? ((thisWeekDeliveries - lastWeekDeliveries) / lastWeekDeliveries) * 100 
      : thisWeekDeliveries > 0 ? 100 : 0

    const monthlyGrowth = lastMonthDeliveries > 0 
      ? ((thisMonthDeliveries - lastMonthDeliveries) / lastMonthDeliveries) * 100 
      : thisMonthDeliveries > 0 ? 100 : 0

    return {
      overview: {
        totalDeliveries,
        completedDeliveries,
        cancelledDeliveries,
        activeDeliveries,
        successRate: Math.round(successRate * 10) / 10
      },
      earnings: {
        total: Math.round(totalEarnings * 100) / 100,
        today: Math.round(todayEarnings * 100) / 100,
        thisWeek: Math.round(weekEarnings * 100) / 100,
        thisMonth: Math.round(monthEarnings * 100) / 100,
        lastMonth: Math.round(lastMonthEarnings * 100) / 100,
        projectedMonthly: Math.round(projectedMonthly * 100) / 100
      },
      performance: {
        averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
        onTimeRate: Math.round(onTimeRate * 10) / 10,
        totalOnTime: onTimeData.onTime,
        totalDelivered: onTimeData.total
      },
      trends: {
        deliveriesThisWeek: thisWeekDeliveries,
        deliveriesLastWeek: lastWeekDeliveries,
        weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
        deliveriesThisMonth: thisMonthDeliveries,
        deliveriesLastMonth: lastMonthDeliveries,
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10
      }
    }
  }
}
