import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Sistema de Entregas',
    template: 'Deliveries - %s'
  },
  description: 'Sistema completo de gerenciamento de entregas'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-zinc-50 text-zinc-950`}>
        <Toaster />
        {children}
      </body>
    </html>
  )
}
