import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function Input({ className, ...rest }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'w-full rounded-sm border border-zinc-400 bg-zinc-100 px-4 py-2 text-sm placeholder-zinc-500 outline-sky-400 disabled:bg-zinc-200',
        className
      )}
      {...rest}
    />
  )
}
