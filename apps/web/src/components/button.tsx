import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'
import { Loading } from './loading'

import colors from 'tailwindcss/colors'

interface ButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean
}

export function Button({ className, children, isLoading, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'flex items-center justify-center gap-2 rounded-md bg-sky-300 px-4 py-2 text-sm font-semibold text-sky-900 transition-all active:scale-[.99] enabled:cursor-pointer enabled:hover:bg-sky-400 disabled:brightness-90',
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
