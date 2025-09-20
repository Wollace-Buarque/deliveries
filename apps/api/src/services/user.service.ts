import bcrypt from 'bcryptjs'
import { UserRepository, UserWithProfile } from '../repositories/user.repository'
import { BaseService } from './base.service'
import { CreateUserDto, UpdateUserDto } from '@deliveries/shared'
import { EventBus } from '../events/event-bus'
import { UserCreatedEvent } from '../events/user-created.event'

export class UserService extends BaseService<UserWithProfile, CreateUserDto, UpdateUserDto> {
  constructor(
    private userRepository: UserRepository,
    private eventBus: EventBus
  ) {
    super(userRepository)
  }

  async create(data: CreateUserDto): Promise<UserWithProfile> {
    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword
    })

    await this.eventBus.emit(new UserCreatedEvent(user.id, user.email, user.role))

    return user
  }

  async findByEmail(email: string): Promise<UserWithProfile | null> {
    return this.userRepository.findByEmail(email)
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  async updatePassword(userId: string, newPassword: string): Promise<UserWithProfile> {
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    return this.userRepository.update(userId, { password: hashedPassword })
  }

  async updateProfile(userId: string, profileData: Partial<UpdateUserDto['profile']>): Promise<UserWithProfile> {
    return this.userRepository.update(userId, { profile: profileData })
  }

  async uploadAvatar(userId: string, avatarUrl: string): Promise<UserWithProfile> {
    return this.userRepository.update(userId, {
      profile: { avatar: avatarUrl }
    })
  }

  async getUsersByRole(
    role: string,
    page = 1,
    limit = 10
  ): Promise<{
    users: UserWithProfile[]
    total: number
  }> {
    const [users, total] = await Promise.all([
      this.userRepository.findMany({ role, page, limit }),
      this.userRepository.count({ role })
    ])

    return { users, total }
  }
}
