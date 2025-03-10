'use client'

import { MetaMaskConnect } from './metamask-connect'
import { WalletBalance } from './wallet-balance'
import { useAccount } from 'wagmi'

export function WalletContainer() {
  const { isConnected } = useAccount()
  
  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-md mx-auto mt-8 mb-8">
      <h2 className="text-2xl font-bebas-neue mb-4 text-center">
        Подключение к Sonic Blaze
      </h2>
      
      <MetaMaskConnect />
      
      {isConnected && (
        <div className="mt-6">
          <WalletBalance />
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500 font-montserrat">
        <p>
          Используется тестовая сеть Sonic Blaze. Для работы с этой сетью добавьте её в MetaMask
          со следующими параметрами:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
          <li>Имя сети: Sonic Blaze</li>
          <li>URL RPC: https://blaze-testnet.calderachain.xyz/http</li>
          <li>ID цепи: 91002</li>
          <li>Символ валюты: BLZ</li>
          <li>Обозреватель блоков: https://blaze-explorer.calderachain.xyz/</li>
        </ul>
      </div>
    </div>
  )
}
