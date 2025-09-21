export type DeliveryStatus = 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'

// Event Types
export interface DomainEvent {
  id: string
  type: string
  aggregateId: string
  data: any
  timestamp: Date
  version: number
}
