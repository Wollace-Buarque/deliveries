import { FocusEvent, useState } from 'react'
import { Label } from '../forms/label'
import { Input } from '../forms/input'
import { InputError } from '../forms/input-error'
import { SignUpSchema } from './signup-form'
import { FieldError } from 'react-hook-form'
import { Button } from '../button'

interface FirstStepProps {
  register: (name: keyof SignUpSchema) => any
  setValue: (name: keyof SignUpSchema, value: any) => void
  clearErrors: (name: (keyof SignUpSchema)[]) => void
  handleBackStep: () => void
  isSubmitting: boolean
  errors: {
    [key in keyof SignUpSchema]?: FieldError
  }
  watch?: (name: string) => any
}

export function SecondStep({ register, setValue, clearErrors, isSubmitting, errors, handleBackStep }: FirstStepProps) {
  const [isFetching, setIsFetching] = useState(false)

  async function handleCepBlur(event: FocusEvent<HTMLInputElement>) {
    const cep = event.target.value.replace(/\D/g, '')
    if (cep.length !== 8) return

    setIsFetching(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()

      if (setValue && !data.erro) {
        setValue('street', data.logradouro || '')
        setValue('neighborhood', data.bairro || '')
        setValue('city', data.localidade || '')
        setValue('state', data.uf || '')
        clearErrors(['street', 'neighborhood', 'city', 'state'])
      }
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input type="text" placeholder="Digite seu nome" {...register('name')} />
        {errors.name && <InputError message={errors.name.message as string} />}
      </div>

      <div>
        <Label htmlFor="phone">Celular</Label>
        <Input type="text" placeholder="Digite seu celular" {...register('phone')} />
        {errors.phone && <InputError message={errors.phone.message as string} />}
      </div>

      <div>
        <Label htmlFor="document">CPF</Label>
        <Input type="text" placeholder="Digite seu CPF" {...register('document')} />
        {errors.document && <InputError message={errors.document.message as string} />}
      </div>

      <div>
        <Label htmlFor="zipCode">CEP</Label>
        <Input
          type="text"
          placeholder="Digite seu CEP"
          {...register('zipCode')}
          onBlur={handleCepBlur}
          disabled={isFetching}
        />
        {errors.zipCode && <InputError message={errors.zipCode.message as string} />}
      </div>

      <div className="flex gap-4">
        <div>
          <Label htmlFor="logradouro">Logradouro</Label>
          <Input type="text" placeholder="Rua/Avenida" {...register('street')} disabled={isFetching} />
          {errors.street && <InputError message={errors.street.message as string} />}
        </div>
        <div>
          <Label htmlFor="neighborhood">Bairro</Label>
          <Input type="text" placeholder="Bairro" {...register('neighborhood')} disabled={isFetching} />
          {errors.neighborhood && <InputError message={errors.neighborhood.message as string} />}
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input type="text" placeholder="Cidade" {...register('city')} disabled={isFetching} />
          {errors.city && <InputError message={errors.city.message as string} />}
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input type="text" placeholder="UF" maxLength={2} {...register('state')} disabled={isFetching} />
          {errors.state && <InputError message={errors.state.message as string} />}
        </div>
      </div>

      <div className="flex gap-4">
        <div>
          <Label htmlFor="number">Número</Label>
          <Input type="text" placeholder="Número" {...register('number')} disabled={isFetching} />
          {errors.number && <InputError message={errors.number.message as string} />}
        </div>

        <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input type="text" placeholder="Complemento" {...register('complement')} disabled={isFetching} />
          {errors.complement && <InputError message={errors.complement.message as string} />}
        </div>
      </div>

      <div className="mt-2 flex justify-between gap-2">
        <button
          type="button"
          className="cursor-pointer rounded-md bg-zinc-300 px-4 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-400"
          onClick={handleBackStep}
          disabled={isSubmitting}
        >
          Voltar
        </button>

        <Button type="submit" isLoading={isSubmitting}>
          Cadastrar
        </Button>
      </div>
    </div>
  )
}
