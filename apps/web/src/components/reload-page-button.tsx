'use client'

import { useRouter } from 'next/navigation'
import { IconReload } from '@tabler/icons-react'

import { Button } from './button'

export function ReloadPageButton() {
  const router = useRouter()

  function handleClick() {
    router.refresh()
  }

  return (
    <Button onClick={handleClick} className="bg-gray-600 text-zinc-300 enabled:hover:bg-gray-700">
      <IconReload />
      Recarregar
    </Button>
  )
}
