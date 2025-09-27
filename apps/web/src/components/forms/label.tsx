import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

export function Label({ className, ...rest }: ComponentProps<'label'>) {
  return <label {...rest} className={cn('mb-1 ml-1 block text-xs', className)} />
}
