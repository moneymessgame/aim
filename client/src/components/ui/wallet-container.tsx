'use client'

import { MetaMaskConnect } from './metamask-connect'
import { WalletBalance } from './wallet-balance'
import { useAccount } from 'wagmi'

export function WalletContainer() {
  const { isConnected } = useAccount()
  
  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-md mx-auto mt-8 mb-8">
      <h2 className="text-2xl font-bebas-neue mb-4 text-center">
        Connect to Sonic Blaze
      </h2>
      
      <MetaMaskConnect />
      
      {isConnected && (
        <div className="mt-6">
          <WalletBalance />
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500 font-montserrat">
        <p>
          The test network Sonic Blaze is used. To work with this network, add it to MetaMask
          with the following parameters:
        </p>
      </div>
    </div>
  )
}
