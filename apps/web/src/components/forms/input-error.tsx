interface InputErrorProps {
  message: string
}

export function InputError({ message }: InputErrorProps) {
  return <span className="text-xs text-red-500 ml-1 block mt-1">{message}</span>
}
