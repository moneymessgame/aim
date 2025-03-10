'use client'

import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { useState } from 'react'

export function MetaMaskConnect() {
  const { connectors, connect, isPending, error } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)
  
  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      connect({ connector: connectors[0] })
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
    } finally {
      setIsConnecting(false)
    }
  }
  
  return (
    <div className="flex flex-col items-center p-4 gap-2 font-montserrat">
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isPending}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
        >
          {isPending ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm bg-gray-100 px-3 py-1 rounded-md">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
          >
            Disconnect
          </button>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-2">
          {error.message || 'Error connecting to MetaMask'}
        </div>
      )}
    </div>
  )
}
