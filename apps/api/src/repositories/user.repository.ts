import { PrismaClient, User, UserProfile } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { CreateUserDto, UpdateUserDto } from '../types/dto';

export interface UserWithProfile extends User {
  profile: UserProfile | null;
}

export class UserRepository extends BaseRepository<UserWithProfile, CreateUserDto, UpdateUserDto> {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async create(data: CreateUserDto): Promise<UserWithProfile> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: data.role,
        profile: {
          create: {
            name: data.profile.name,
            phone: data.profile.phone,
            document: data.profile.document,
            address: {
              create: data.profile.address,
            },
          },
        },
      },
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findMany(filters?: {
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<UserWithProfile[]> {
    const { role, page = 1, limit = 10 } = filters || {};
    const skip = (page - 1) * limit;

    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      skip,
      take: limit,
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<UserWithProfile> {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.profile && {
          profile: {
            update: {
              ...(data.profile.name && { name: data.profile.name }),
              ...(data.profile.phone && { phone: data.profile.phone }),
              ...(data.profile.document && { document: data.profile.document }),
              ...(data.profile.avatar && { avatar: data.profile.avatar }),
              ...(data.profile.address && {
                address: {
                  update: data.profile.address,
                },
              }),
            },
          },
        }),
      },
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async count(filters?: { role?: string }): Promise<number> {
    return this.prisma.user.count({
      where: filters?.role ? { role: filters.role as any } : undefined,
    });
  }
}
