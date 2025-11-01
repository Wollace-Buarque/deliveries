import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { IconTruckDelivery, IconPackage } from '@tabler/icons-react'

import { Separator } from '@/components/separator'
import { MyDeliveriesQuery } from '@/components/delivery-management/my-deliveries-query'
import { AvailableDeliveriesQuery } from '@/components/delivery-management/available-deliveries-query'
import { DeliveryStatsQuery } from '@/components/delivery-management/delivery-stats-query'
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
  const myPage = params?.myPage ? Number(params.myPage) : 1
  const availablePage = params?.availablePage ? Number(params.availablePage) : 1

  return (
    <main className="container mx-auto flex flex-1 flex-col p-12">
      <DeliveryStatsQuery />

      <div className="flex items-end gap-4">
        <IconTruckDelivery size={96} stroke={1} className="text-zinc-400" />

        <div>
          <h1 className="text-3xl font-semibold">Minhas Entregas</h1>
          <p className="mt-2 text-zinc-600">Gerencie o status das suas entregas em andamento</p>
        </div>
      </div>

      <Separator />

      <div className="mb-12 flex flex-1 flex-col">
        <MyDeliveriesQuery initialPage={myPage} />
      </div>

      <div className="mt-8 flex items-end gap-4">
        <IconPackage size={96} stroke={1} className="text-zinc-400" />

        <div>
          <h2 className="text-3xl font-semibold">Entregas Disponíveis</h2>
          <p className="mt-2 text-zinc-600">Aceite novas entregas para realizar • Atualização automática a cada 15s</p>
        </div>
      </div>

      <Separator />

      <div className="flex flex-1 flex-col">
        <AvailableDeliveriesQuery initialPage={availablePage} />
      </div>
    </main>
  )
}
