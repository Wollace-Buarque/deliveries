import { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { IconTruckDelivery, IconPackage } from '@tabler/icons-react'

import { Separator } from '@/components/separator'
import { MyDeliveries } from '@/components/delivery-management/my-deliveries'
import { AvailableDeliveries } from '@/components/delivery-management/available-deliveries'
import { DeliveriesSkeleton } from '@/components/deliveries/deliveries-skeleton'
import { DeliveryStatsDashboard } from '@/components/delivery-management/delivery-stats-dashboard'
import { getUserRole } from '@/app/actions/user'

export const metadata: Metadata = {
  title: 'Gerenciar Entregas - Sistema de Entregas',
  description: 'Gerencie suas entregas e aceite novas entregas'
}

export default async function DeliveryManagementPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const role = await getUserRole()

  // Apenas entregadores podem acessar esta página
  if (role !== 'DELIVERY') {
    redirect('/')
  }

  const params = await searchParams

  return (
    <main className="container mx-auto flex flex-1 flex-col p-12">
      <Suspense fallback={<div className="mb-8 h-96 animate-pulse rounded-lg bg-zinc-100"></div>}>
        <DeliveryStatsDashboard />
      </Suspense>

      <div className="flex items-end gap-4">
        <IconTruckDelivery size={96} stroke={1} className="text-zinc-400" />

        <div>
          <h1 className="text-3xl font-semibold">Minhas Entregas</h1>
          <p className="mt-2 text-zinc-600">Gerencie o status das suas entregas em andamento</p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col mb-12">
        <Suspense fallback={<DeliveriesSkeleton />}>
          <MyDeliveries params={params} />
        </Suspense>
      </div>

      <div className="flex items-end gap-4 mt-8">
        <IconPackage size={96} stroke={1} className="text-zinc-400" />

        <div>
          <h2 className="text-3xl font-semibold">Entregas Disponíveis</h2>
          <p className="mt-2 text-zinc-600">Aceite novas entregas para realizar</p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col">
        <Suspense fallback={<DeliveriesSkeleton />}>
          <AvailableDeliveries params={params} />
        </Suspense>
      </div>
    </main>
  )
}

