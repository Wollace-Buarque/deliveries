'use client'

import Cookies from 'js-cookie'
import z from 'zod'
import Link from 'next/link'

import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'

import { signIn } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { Label } from '../forms/label'
import { Input } from '../forms/input'
import { InputError } from '../forms/input-error'
import { Button } from '../button'

const signInSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(8, 'No mínimo 8 caracteres')
})

export type SignInSchema = z.infer<typeof signInSchema>

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched'
  })

  useEffect(() => {
    const hasDisconnectedBecauseTokenExpired = !!Cookies.get('jwt_expired')
    if (hasDisconnectedBecauseTokenExpired) {
      toast.warning('Sua sessão expirou.')
      Cookies.remove('jwt_expired', { path: '/login' })
    }
  }, [])

  async function handleSignIn(data: SignInSchema) {
    const response = await signIn(data)
    if (!response.success) return toast.error(response.message)

    toast.success(response.message)

    redirect('/')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Entrar</h1>
      <p className="mt-1 text-sm text-zinc-700">Informe seu e-mail e sua senha.</p>

      <form onSubmit={handleSubmit(handleSignIn)} className="mt-4">
        <div className="flex w-96 flex-col gap-3">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input type="email" id="email" placeholder="Digite seu e-mail" {...register('email')} />
            <InputError field={errors.email} />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input type="password" id="password" placeholder="Digite sua senha" {...register('password')} />
            <InputError field={errors.password} />
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </div>
      </form>

      <div className="mt-4 text-sm text-zinc-700">
        <span>Não tem uma conta?</span>{' '}
        <Link href="/register" className="text-sky-700 hover:underline">
          Crie uma agora
        </Link>
      </div>
    </div>
  )
}
