import { Delivery } from '@/app/actions/deliveries'
import { cn } from '@/lib/utils'

const statusObject = {
  PENDING: {
    translation: 'Pendente',
    className: 'bg-orange-50 text-orange-700'
  },
  ACCEPTED: {
    translation: 'Aceito',
    className: 'bg-green-50 text-green-700'
  },
  PICKED_UP: {
    translation: 'Coletado',
    className: 'bg-blue-50 text-blue-700'
  },
  IN_TRANSIT: {
    translation: 'Em Trânsito',
    className: 'bg-violet-50 text-violet-700'
  },
  DELIVERED: {
    translation: 'Entregue',
    className: 'bg-emerald-50 text-emerald-700'
  },
  CANCELLED: {
    translation: 'Cancelado',
    className: 'bg-red-50 text-red-700'
  }
} as const

type StatusKey = keyof typeof statusObject

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface DeliveryCardProps {
  delivery: Delivery
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  const status = delivery.status as StatusKey
  const parsedStatus = statusObject[status]

  return (
    <article className="rounded-lg bg-zinc-50 p-4 shadow-sm">
      <div className="flex justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span
              className={cn(`rounded-full px-3 py-1 text-xs font-semibold`, {
                [parsedStatus.className]: true
              })}
            >
              {parsedStatus.translation.toUpperCase()}
            </span>

            <h3 className="line-clamp-1 text-lg font-semibold">{delivery.description ?? `Entrega #${delivery.id}`}</h3>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-800">Cliente:</strong> {delivery.client.profile.name} —{' '}
              {delivery.client.email}
            </div>

            <div className="mt-2">
              <strong className="text-gray-800">Origem:</strong> {delivery.origin.street}, {delivery.origin.number} —{' '}
              {delivery.origin.neighborhood}
            </div>

            <div className="mt-1">
              <strong className="text-gray-800">Destino:</strong> {delivery.destination.street},{' '}
              {delivery.destination.number} — {delivery.destination.neighborhood}
            </div>
          </div>
        </div>

        <div className="min-w-36 text-right">
          <div className="text-lg font-bold">{formatCurrency(delivery.value)}</div>
          <div className="mt-2 text-sm text-gray-600">Estimado: {delivery.estimatedTime} min</div>

          {delivery.actualTime && <div className="text-sm text-gray-600">Atual: {delivery.actualTime} min</div>}
        </div>
      </div>
    </article>
  )
}
