import { PrismaClient, Delivery, DeliveryStatus } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { CreateDeliveryDto, UpdateDeliveryDto } from '../types/dto';

export interface DeliveryWithDetails extends Delivery {
  client: {
    id: string;
    email: string;
    profile: {
      name: string;
      phone: string;
    } | null;
  };
  deliveryPerson?: {
    id: string;
    email: string;
    profile: {
      name: string;
      phone: string;
    } | null;
  } | null;
  origin: {
    id: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: any;
  };
  destination: {
    id: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: any;
  };
}

export class DeliveryRepository extends BaseRepository<DeliveryWithDetails, CreateDeliveryDto, UpdateDeliveryDto> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: CreateDeliveryDto): Promise<DeliveryWithDetails> {
    return this.prisma.delivery.create({
      data: {
        clientId: data.clientId,
        status: 'PENDING',
        description: data.description,
        value: data.value,
        estimatedTime: data.estimatedTime || 30,
        origin: {
          create: data.origin,
        },
        destination: {
          create: data.destination,
        },
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        origin: true,
        destination: true,
      },
    });
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
                phone: true,
              },
            },
          },
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        origin: true,
        destination: true,
      },
    });
  }

  async findMany(filters?: {
    status?: DeliveryStatus;
    clientId?: string;
    deliveryId?: string;
    page?: number;
    limit?: number;
  }): Promise<DeliveryWithDetails[]> {
    const { status, clientId, deliveryId, page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    return this.prisma.delivery.findMany({
      where: {
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...(deliveryId && { deliveryId }),
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
                phone: true,
              },
            },
          },
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        origin: true,
        destination: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateDeliveryDto): Promise<DeliveryWithDetails> {
    return this.prisma.delivery.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.deliveryId && { deliveryId: data.deliveryId }),
        ...(data.actualTime && { actualTime: data.actualTime }),
      },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        deliveryPerson: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        origin: true,
        destination: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.delivery.delete({
      where: { id },
    });
  }

  async count(filters?: {
    status?: DeliveryStatus;
    clientId?: string;
    deliveryId?: string;
  }): Promise<number> {
    return this.prisma.delivery.count({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.deliveryId && { deliveryId: filters.deliveryId }),
      },
    });
  }

  async findByStatus(status: DeliveryStatus): Promise<DeliveryWithDetails[]> {
    return this.findMany({ status });
  }

  async acceptDelivery(id: string, deliveryPersonId: string): Promise<DeliveryWithDetails> {
    return this.update(id, {
      status: 'ACCEPTED',
      deliveryId: deliveryPersonId,
    });
  }

  async updateStatus(id: string, status: DeliveryStatus, actualTime?: number): Promise<DeliveryWithDetails> {
    return this.update(id, {
      status,
      actualTime,
    });
  }
}
