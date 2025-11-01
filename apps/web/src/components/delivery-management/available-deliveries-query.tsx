'use client'

import { IconAlertHexagon, IconMoodEmpty, IconRefresh, IconClock } from '@tabler/icons-react'
import { useAvailableDeliveries } from '@/hooks/use-deliveries'
import { DeliveryManagementCard } from './delivery-management-card'
import { Pagination } from '../pagination'
import { Button } from '../button'

interface AvailableDeliveriesQueryProps {
  initialPage?: number
}

export function AvailableDeliveriesQuery({ initialPage = 1 }: AvailableDeliveriesQueryProps) {
  const {
    data: deliveries,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAvailableDeliveries(initialPage)

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-zinc-200"></div>
        ))}
      </div>
    )
  }

  if (isError || !deliveries?.success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <IconAlertHexagon className="text-red-500" size={64} stroke={1} />

        <p className="text-lg text-red-500">Algo deu errado ao listar as entregas disponíveis.</p>

        <Button onClick={() => refetch()} className="bg-sky-500 text-white hover:bg-sky-600">
          <IconRefresh size={20} />
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!deliveries.data.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <IconMoodEmpty className="text-zinc-500" size={64} stroke={1} />

        <p className="text-lg text-zinc-500">Não há entregas disponíveis no momento.</p>
        <p className="text-sm text-zinc-400">A lista será atualizada automaticamente a cada 15 segundos.</p>

        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
        >
          <IconRefresh size={16} className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Buscando...' : 'Buscar agora'}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {deliveries.data.map((delivery) => (
          <DeliveryManagementCard key={delivery.id} delivery={delivery} isAvailable />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
          >
            <IconRefresh size={16} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Atualizando...' : 'Buscar novas entregas'}
          </Button>
        </div>

        <Pagination pagination={deliveries.pagination} pageParam="availablePage" />
      </div>
    </>
  )
}
