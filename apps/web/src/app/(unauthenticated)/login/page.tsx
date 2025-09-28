import { SignInForm } from '@/components/signin-form/signin-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar',
}

export default function SignInPage() {
  return <SignInForm />
}
