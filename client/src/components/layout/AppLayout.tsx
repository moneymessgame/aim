'use client'

import { ReactNode } from 'react'
import Header from './Header'
import { Toaster } from '@/components/ui/sonner'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
