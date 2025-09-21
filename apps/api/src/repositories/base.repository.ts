import { PrismaClient } from '@generated/prisma'

export abstract class BaseRepository<T, CreateDto, UpdateDto> {
  constructor(protected prisma: PrismaClient) {}

  abstract create(data: CreateDto): Promise<T>
  abstract findById(id: string): Promise<T | null>
  abstract findMany(filters?: any): Promise<T[]>
  abstract update(id: string, data: UpdateDto): Promise<T>
  abstract delete(id: string): Promise<void>
  abstract count(filters?: any): Promise<number>
}
