import { PrismaClient, Delivery, DeliveryStatus } from '@generated/prisma'
import { BaseRepository } from './base.repository'
import { CreateDeliveryDto, UpdateDeliveryDto } from '@deliveries/shared'

export interface DeliveryWithDetails extends Delivery {
  client: {
    id: string
    email: string
    profile: {
      name: string
      phone: string
    } | null
  }
  deliveryPerson?: {
    id: string
    email: string
    profile: {
      name: string
      phone: string
    } | null
  } | null
  origin: {
    id: string
    street: string
    number: string
    complement?: string | null
    neighborhood: string
    city: string
    state: string
    zipCode: string
    coordinates: any
  }
  destination: {
    id: string
    street: string
    number: string
    complement?: string | null
    neighborhood: string
    city: string
    state: string
    zipCode: string
    coordinates: any
  }
}

export class DeliveryRepository extends BaseRepository<DeliveryWithDetails, CreateDeliveryDto, UpdateDeliveryDto> {
  constructor(prisma: PrismaClient) {
    super(prisma)
  }

  async create(data: CreateDeliveryDto): Promise<DeliveryWithDetails> {
    return await this.prisma.delivery.create({
      data: {
        status: 'PENDING',
        description: data.description,
        value: data.value,
        estimatedTime: data.estimatedTime ?? 30,
        client: {
          connect: {
            id: data.clientId
          }
        },
        origin: {
          create: {
            street: data.origin.street,
            number: data.origin.number,
            neighborhood: data.origin.neighborhood,
            city: data.origin.city,
            state: data.origin.state,
            zipCode: data.origin.zipCode,
            coordinates: data.origin.coordinates,
            ...(data.origin.complement ? { complement: data.origin.complement } : {})
          }
        },
        destination: {
          create: {
            street: data.destination.street,
            number: data.destination.number,
            neighborhood: data.destination.neighborhood,
            city: data.destination.city,
            state: data.destination.state,
            zipCode: data.destination.zipCode,
            coordinates: data.destination.coordinates,
            ...(data.destination.complement ? { complement: data.destination.complement } : {})
          }
        }
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        origin: true,
        destination: true
      }
    })
  }

  async findById(id: string): Promise<DeliveryWithDetails | null> {
    return this.prisma.delivery.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        origin: true,
        destination: true
      }
    })
  }

  async findMany(filters?: {
    status?: DeliveryStatus
    clientId?: string
    deliveryId?: string
    page?: number
    limit?: number
  }): Promise<DeliveryWithDetails[]> {
    const { status, clientId, deliveryId, page = 1, limit = 10 } = filters || {}
    const skip = (page - 1) * limit

    return this.prisma.delivery.findMany({
      where: {
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...(deliveryId && { deliveryId })
      },
      skip,
      take: limit,
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        origin: true,
        destination: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async update(
    id: string,
    data: UpdateDeliveryDto & { status?: DeliveryStatus; deliveryId?: string; actualTime?: number }
  ): Promise<DeliveryWithDetails> {
    return this.prisma.delivery.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.deliveryId !== undefined && { deliveryId: data.deliveryId }),
        ...(data.actualTime !== undefined && { actualTime: data.actualTime }),
        ...(data.clientId !== undefined && { clientId: data.clientId }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.value !== undefined && { value: data.value })
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        origin: true,
        destination: true
      }
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.delivery.delete({
      where: { id }
    })
  }

  async count(filters?: { status?: DeliveryStatus; clientId?: string; deliveryId?: string }): Promise<number> {
    return this.prisma.delivery.count({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.deliveryId && { deliveryId: filters.deliveryId })
      }
    })
  }

  async findByStatus(status: DeliveryStatus): Promise<DeliveryWithDetails[]> {
    return this.findMany({ status })
  }

  async acceptDelivery(id: string, deliveryPersonId: string): Promise<DeliveryWithDetails> {
    return this.update(id, {
      status: 'ACCEPTED',
      deliveryId: deliveryPersonId
    })
  }

  async updateStatus(id: string, status: DeliveryStatus, actualTime?: number): Promise<DeliveryWithDetails> {
    return this.update(id, {
      status,
      actualTime
    })
  }

  // Metrics methods
  async getTotalEarnings(deliveryPersonId: string, startDate?: Date, endDate?: Date): Promise<number> {
    const result = await this.prisma.delivery.aggregate({
      where: {
        deliveryId: deliveryPersonId,
        status: 'DELIVERED',
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        })
      },
      _sum: {
        value: true
      }
    })

    return result._sum.value || 0
  }

  async getAverageDeliveryTime(deliveryPersonId: string): Promise<number> {
    const result = await this.prisma.delivery.aggregate({
      where: {
        deliveryId: deliveryPersonId,
        status: 'DELIVERED',
        actualTime: {
          not: null
        }
      },
      _avg: {
        actualTime: true
      }
    })

    return result._avg.actualTime || 0
  }

  async getOnTimeDeliveryRate(deliveryPersonId: string): Promise<{ onTime: number; total: number }> {
    const allDelivered = await this.prisma.delivery.findMany({
      where: {
        deliveryId: deliveryPersonId,
        status: 'DELIVERED',
        actualTime: {
          not: null
        }
      },
      select: {
        actualTime: true,
        estimatedTime: true
      }
    })

    const onTimeDeliveries = allDelivered.filter(
      delivery => delivery.actualTime! <= delivery.estimatedTime
    ).length

    return {
      onTime: onTimeDeliveries,
      total: allDelivered.length
    }
  }

  async getDeliveriesByPeriod(
    deliveryPersonId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DeliveryWithDetails[]> {
    return this.prisma.delivery.findMany({
      where: {
        deliveryId: deliveryPersonId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true
              }
            }
          }
        },
        origin: true,
        destination: true
      }
    })
  }
}
