import { DeliveryCardSkeleton } from './delivery-card-skeleton'

const amountOfItems = 10
const fakeItems = Array.from({ length: amountOfItems }, (_, index) => index)

export function DeliveriesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {fakeItems.map((_, index) => (
        <DeliveryCardSkeleton key={`deliveries-skeleton-${index}`} />
      ))}
    </div>
  )
}
