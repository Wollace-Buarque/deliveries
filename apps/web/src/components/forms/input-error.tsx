import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'
import type { FieldError } from 'react-hook-form'
interface InputErrorProps extends ComponentProps<'span'> {
  field?: FieldError
}

export function InputError({ field, className, ...rest }: InputErrorProps) {
  if (!field) return null

  return (
    <span className={cn('mt-1 ml-1 block text-xs text-red-500', className)} {...rest}>
      {field.message}
    </span>
  )
}
