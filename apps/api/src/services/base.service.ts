import { BaseRepository } from '../repositories/base.repository'

export abstract class BaseService<T, CreateDto, UpdateDto> {
  constructor(protected repository: BaseRepository<T, CreateDto, UpdateDto>) {}

  async create(data: CreateDto): Promise<T> {
    return this.repository.create(data)
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findById(id)
  }

  async findMany(filters?: any): Promise<T[]> {
    return this.repository.findMany(filters)
  }

  async update(id: string, data: UpdateDto): Promise<T> {
    return this.repository.update(id, data)
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  async count(filters?: any): Promise<number> {
    return this.repository.count(filters)
  }
}
