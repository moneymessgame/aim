'use client'

import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { SONIC_TOKEN_ADDRESS } from '../../lib/config'
import { useEffect, useState } from 'react'

// ABI для ERC20 токена (минимальный для чтения баланса)
const erc20ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export function WalletBalance() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({
    address,
    enabled: !!address,
  })
  
  const { data: tokenBalance } = useReadContract({
    address: SONIC_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  })
  
  const { data: tokenDecimals } = useReadContract({
    address: SONIC_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20ABI,
    functionName: 'decimals',
    enabled: !!address,
  })
  
  const { data: tokenSymbol } = useReadContract({
    address: SONIC_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20ABI,
    functionName: 'symbol',
    enabled: !!address,
  })
  
  const [formattedTokenBalance, setFormattedTokenBalance] = useState<string>('0')
  
  useEffect(() => {
    if (tokenBalance && tokenDecimals) {
      const divisor = BigInt(10) ** BigInt(tokenDecimals)
      const formatted = Number(tokenBalance) / Number(divisor)
      setFormattedTokenBalance(formatted.toFixed(4))
    }
  }, [tokenBalance, tokenDecimals])

  if (!isConnected) {
    return null
  }

  return (
    <div className="font-montserrat bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col gap-3 min-w-[300px]">
      <h2 className="text-xl font-semibold">Баланс кошелька</h2>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Основная валюта:</span>
          <span className="font-medium">
            {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Загрузка...'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Токены Sonic:</span>
          <span className="font-medium">
            {tokenBalance ? `${formattedTokenBalance} ${tokenSymbol || 'SONIC'}` : 'Загрузка...'}
          </span>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Сеть: Sonic Blaze Testnet
      </div>
    </div>
  )
}
