'use client'

import { IconAlertHexagon, IconMoodEmpty, IconRefresh } from '@tabler/icons-react'
import { useMyDeliveries } from '@/hooks/use-deliveries'
import { DeliveryManagementCard } from './delivery-management-card'
import { Pagination } from '../pagination'
import { Button } from '../button'

interface MyDeliveriesQueryProps {
  initialPage?: number
}

export function MyDeliveriesQuery({ initialPage = 1 }: MyDeliveriesQueryProps) {
  const { data: deliveries, isLoading, isError, refetch, isFetching } = useMyDeliveries(initialPage)

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
        <p className="text-lg text-red-500">Algo deu errado ao listar suas entregas.</p>
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
        <p className="text-lg text-zinc-500">Você não possui nenhuma entrega no momento.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {deliveries.data.map((delivery) => (
          <DeliveryManagementCard key={delivery.id} delivery={delivery} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="bg-zinc-600 text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          <IconRefresh size={16} className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Atualizando...' : 'Atualizar'}
        </Button>

        <Pagination pagination={deliveries.pagination} pageParam="myPage" />
      </div>
    </>
  )
}

