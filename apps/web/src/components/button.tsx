import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'
import { Loading } from './loading'

import colors from 'tailwindcss/colors'

interface ButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean
  variant?: 'default' | 'outline'
}

export function Button({ className, children, isLoading, variant = 'default', ...rest }: ButtonProps) {
  const variants = {
    default: 'bg-sky-300 text-sky-900 hover:bg-sky-400',
    outline: 'bg-transparent border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
  }

  return (
    <button
      className={cn(
        'flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all active:scale-[.99] enabled:cursor-pointer disabled:brightness-90',
        variants[variant],
        className
      )}
      {...rest}
      disabled={isLoading || rest.disabled}
    >
      {isLoading && <Loading color={colors.sky[950]} size={16} />}

      {children}
    </button>
  )
}
