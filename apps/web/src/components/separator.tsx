import { Separator as RadixSeparator, SeparatorProps } from '@radix-ui/react-separator'

export function Separator({ ...rest }: SeparatorProps) {
  return (
    <RadixSeparator
      decorative
      className="my-4 bg-zinc-300 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
      {...rest}
    />
  )
}
