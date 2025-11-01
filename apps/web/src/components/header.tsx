'use client'

import Link from 'next/link'
import { IconChevronLeft, IconTruckDelivery } from '@tabler/icons-react'
import { usePathname, useRouter } from 'next/navigation'

import { AccountDropdownMenu } from './account-dropdown-menu'
import { CreateDeliveryForm } from './create-delivery-form/create-delivery-form'

interface HeaderProps {
  userRole: 'CLIENT' | 'DELIVERY' | 'ADMIN' | null
}

export function Header({ userRole }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  const shouldShowBackButton = pathname !== '/'
  const isDeliveryPerson = userRole === 'DELIVERY'

  function handleGoBack() {
    router.back()
  }

  return (
    <header className="flex items-center justify-between border border-b-zinc-300 p-5">
      <div className="flex items-center gap-1">
        {shouldShowBackButton && (
          <button onClick={handleGoBack} className="cursor-pointer transition-transform hover:scale-125">
            <IconChevronLeft className="text-sky-400" />
            <span className="sr-only">Voltar</span>
          </button>
        )}

        <IconTruckDelivery />
      </div>

      <nav>
        <ul className="flex items-center gap-4 align-baseline text-sm *:transition-colors *:hover:text-zinc-800">
          <li>
            <Link href="/" className="font-medium">
              Início
            </Link>
          </li>
          {isDeliveryPerson && (
            <li>
              <Link href="/deliveries" className="font-medium">
                Gerenciar Entregas
              </Link>
            </li>
          )}
          {!isDeliveryPerson && (
            <li>
              <CreateDeliveryForm />
            </li>
          )}
          <li>
            <AccountDropdownMenu />
          </li>
        </ul>
      </nav>
    </header>
  )
}
