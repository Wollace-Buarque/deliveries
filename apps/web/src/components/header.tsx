import { IconTruckDelivery } from '@tabler/icons-react'
import { AccountDropdownMenu } from './account-dropdown-menu'

export function Header() {
  return (
    <header className="flex items-center justify-between border border-b-zinc-300 p-5">
      <IconTruckDelivery />

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
