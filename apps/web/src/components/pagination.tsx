'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'

import { ApiPagination } from '@/app/actions/deliveries'

import Link from 'next/link'

interface PaginationProps {
  pagination: ApiPagination
}

export function Pagination({ pagination }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hasBackPage = pagination.page > 1
  const hasNextPage = pagination.page < pagination.totalPages

  function createPageURL(pageNumber: number | string) {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    params.set('limit', pagination.limit.toString())

    return `${pathname}?${params.toString()}`
  }

  if (pagination.totalPages === 1) return null

  return (
    <div className="flex items-center justify-end gap-2">
      {hasBackPage && (
        <Link
          className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-500 px-4 py-2 text-sm font-semibold text-zinc-50 transition-all hover:bg-zinc-600 active:scale-[.99]"
          href={createPageURL(pagination.page - 1)}
        >
          <IconArrowLeft />
        </Link>
      )}

      <div className="rounded-md border border-zinc-400 bg-zinc-500 px-4 py-2 text-white select-none">
        <strong>{pagination.page}</strong>/<strong>{pagination.totalPages}</strong>
      </div>

      {hasNextPage && (
        <Link
          className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-500 px-4 py-2 text-sm font-semibold text-zinc-50 transition-all hover:bg-zinc-600 active:scale-[.99]"
          href={createPageURL(pagination.page + 1)}
        >
          <IconArrowRight />
        </Link>
      )}
    </div>
  )
}
