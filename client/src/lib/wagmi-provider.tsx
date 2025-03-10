'use client'

import { WagmiProvider, createConfig, http } from 'wagmi'
import { sonicBlazeChain } from './config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { metaMask } from '@wagmi/connectors'
import { ReactNode, useState } from 'react'

export function WagmiContextProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  
  const config = createConfig({
    chains: [sonicBlazeChain],
    transports: {
      [sonicBlazeChain.id]: http(),
    },
    connectors: [
      metaMask(),
    ],
  })

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
