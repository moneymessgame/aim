'use client'

import { ReactNode } from 'react'
import Header from './Header'
import { Toaster } from '@/components/ui/sonner'
import { TranscriptionSidebar } from './TranscriptionSidebar'
import { TranscriptionProvider } from '@/lib/transcription-context'
import { VoiceControlAside } from './VoiceControlAside'
import { useAccount } from 'wagmi'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isConnected } = useAccount()
  
  return (
    <TranscriptionProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex">
          {/* Боковая панель с трансляцией - отображается только для авторизованных пользователей */}
          {isConnected && (
            <aside className="w-100 p-4 hidden md:block border-r bg-white">
              <VoiceControlAside />
            </aside>
          )}
          
          {/* Основное содержимое */}
          <main className="flex-grow bg-gray-100">
            {children}
          </main>
        </div>
        <Toaster />
        
      </div>
    </TranscriptionProvider>
  )
}
