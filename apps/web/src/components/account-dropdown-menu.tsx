'use client'

import { toast } from 'sonner'
import { redirect } from 'next/navigation'
import { IconChevronDown, IconLogout, IconUserCircle } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem
} from '@radix-ui/react-dropdown-menu'

import { logout } from '@/app/actions/auth'
import Link from 'next/link'

export function AccountDropdownMenu() {
  async function handleLogout() {
    const response = await logout()

    toast.info(response.message)

    redirect('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex cursor-pointer items-center gap-1">
          Conta
          <IconChevronDown size={16} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          className="min-w-[220px] origin-top-right rounded-lg bg-gray-100 p-1.5 shadow-md"
        >
          <DropdownMenuItem asChild>
            <Link
              href="/account"
              className="flex h-9 cursor-pointer items-center justify-between rounded-md px-2 text-sm text-zinc-800 outline-none data-[highlighted]:bg-gray-200"
            >
              Minha Conta
              <IconUserCircle size={16} />
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <button
              onClick={handleLogout}
              className="flex h-9 w-full cursor-pointer items-center justify-between rounded-md px-2 text-sm text-red-400 outline-none data-[highlighted]:bg-gray-200"
            >
              Sair
              <IconLogout size={16} />
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}
