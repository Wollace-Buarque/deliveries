'use client'

import { IconChevronLeft, IconTruckDelivery } from '@tabler/icons-react'
import { usePathname, useRouter } from 'next/navigation'

import { AccountDropdownMenu } from './account-dropdown-menu'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const shouldShowBackButton = pathname !== '/'

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

      <div>
        <ul className="flex gap-4 align-baseline text-sm *:transition-colors *:hover:text-zinc-800">
          <li>
            <AccountDropdownMenu />
          </li>
        </ul>
      </div>
    </header>
  )
}
