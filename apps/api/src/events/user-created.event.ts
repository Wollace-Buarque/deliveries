import { DomainEvent } from '@deliveries/shared'

export class UserCreatedEvent implements DomainEvent {
  public readonly id: string
  public readonly type: string
  public readonly aggregateId: string
  public readonly data: any
  public readonly timestamp: Date
  public readonly version: number

  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly role: string
  ) {
    this.id = `user-created-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.type = 'USER_CREATED'
    this.aggregateId = userId
    this.data = {
      userId,
      email,
      role
    }
    this.timestamp = new Date()
    this.version = 1
  }
}
