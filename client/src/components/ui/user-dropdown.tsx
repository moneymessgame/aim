'use client'

import React, { useState, useEffect, useContext } from 'react'
import { useAccount, useDisconnect, useBalance, useConnect } from 'wagmi'
import { useReadContract } from 'wagmi'
import { SONIC_TOKEN_ADDRESS, sonicBlazeChain } from '../../lib/config'

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

// Создаем контекст для управления состоянием выпадающих меню
type DropdownContextType = {
  closeAllDropdowns: () => void;
  registerDropdown: (id: string, setIsOpen: (open: boolean) => void) => void;
  openDropdown: (id: string) => void;
};

export const DropdownContext = React.createContext<DropdownContextType | null>(null);

export function UserDropdown() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isOpen, setIsOpen] = useState(false)
  const [networkInfoOpen, setNetworkInfoOpen] = useState(false)
  const [formattedTokenBalance, setFormattedTokenBalance] = useState<string>('0')
  const [copySuccess, setCopySuccess] = useState(false)
  
  // Получаем баланс основной валюты
  const { data: balance } = useBalance({
    address,
    enabled: !!address && isConnected,
  })
  
  // Получаем баланс токенов
  const { data: tokenBalance } = useReadContract({
    address: SONIC_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address && isConnected,
  })
  
  const { data: tokenDecimals } = useReadContract({
    address: SONIC_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20ABI,
    functionName: 'decimals',
    enabled: !!address && isConnected,
  })
  
  const { data: tokenSymbol } = useReadContract({
    address: SONIC_TOKEN_ADDRESS as `0x${string}`,
    abi: erc20ABI,
    functionName: 'symbol',
    enabled: !!address && isConnected,
  })
  
  // Форматируем баланс токенов
  useEffect(() => {
    if (tokenBalance && tokenDecimals) {
      const divisor = BigInt(10) ** BigInt(tokenDecimals)
      const formatted = Number(tokenBalance) / Number(divisor)
      setFormattedTokenBalance(formatted.toFixed(4))
    }
  }, [tokenBalance, tokenDecimals])

  // Копирование адреса в буфер обмена с визуальной обратной связью
  const copyAddressToClipboard = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopySuccess(true) // Меняем иконку на галочку
        setTimeout(() => setCopySuccess(false), 2000) // Возвращаем исходную иконку через 2 секунды
      })
      .catch(err => {
        console.error('Ошибка копирования:', err)
      })
  }
  
  // Соединение с MetaMask
  const { connectors, connect: connectWallet } = useConnect()
  const [isConnecting, setIsConnecting] = useState(false)
  
  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      connectWallet({ connector: connectors[0] })
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
    } finally {
      setIsConnecting(false)
    }
  }
  
  // Управление выпадающими меню - обеспечиваем, что только одно меню активно
  const handleUserDropdownToggle = () => {
    // Закрываем информацию о сети при открытии меню пользователя
    if (!isOpen) {
      setNetworkInfoOpen(false);
    }
    setIsOpen(!isOpen);
  }

  const handleNetworkInfoToggle = () => {
    // Закрываем меню пользователя при открытии информации о сети
    if (!networkInfoOpen) {
      setIsOpen(false);
    }
    setNetworkInfoOpen(!networkInfoOpen);
  }

  // При клике в другое место закрываем выпадающее меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.user-dropdown') && !target.closest('.network-info')) {
        setIsOpen(false)
        setNetworkInfoOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative">
      {isConnected ? (
        <div className="flex items-center">
          <button 
            onClick={handleNetworkInfoToggle}
            className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-l-md font-medium transition mr-px"
          >
            <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-2"></span>
            {sonicBlazeChain.name}
          </button>
          
          <button 
            onClick={handleUserDropdownToggle}
            className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-r-md font-medium transition user-dropdown"
          >
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Loading...'}
            <span className="ml-1">{isOpen ? '▲' : '▼'}</span>
          </button>
          
          {/* Information about the network */}
          {networkInfoOpen && (
            <div className="absolute right-0 mt-1 top-full bg-white rounded-md shadow-lg p-4 z-10 w-80 network-info">
              <h3 className="text-sm font-semibold mb-2">Network Information</h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Network Name:</span>
                  <span className="font-medium">{sonicBlazeChain.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">URL RPC:</span>
                  <span className="font-medium">{sonicBlazeChain.rpcUrls.default.http[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chain ID:</span>
                  <span className="font-medium">{sonicBlazeChain.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Currency Symbol:</span>
                  <span className="font-medium">{sonicBlazeChain.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Block Explorer:</span>
                  <a 
                    href={sonicBlazeChain.blockExplorers?.default.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {sonicBlazeChain.blockExplorers?.default.url}
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {/* Выпадающее меню пользователя */}
          {isOpen && (
            <div className="absolute right-0 mt-1 top-full bg-white rounded-md shadow-lg p-4 z-10 w-64 user-dropdown">
              <div 
                onClick={copyAddressToClipboard}
                className="flex justify-between cursor-pointer hover:bg-slate-50 p-2 rounded transition"
              >
                <span className="text-sm font-medium">Your Address:</span>
                <div className="flex items-center">
                  <span className="text-sm text-blue-600 mr-1">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}</span>
                  {copySuccess ? (
                    <span className="text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  ) : (
                    <span className="text-gray-400 hover:text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="my-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Balance:</span>
                  <span className="text-sm font-medium">
                    {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tokens:</span>
                  <span className="text-sm font-medium">
                    {tokenBalance ? `${formattedTokenBalance} ${tokenSymbol || 'SONIC'}` : 'Loading...'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => disconnect()}
                className="mt-3 w-full text-center bg-red-500 hover:bg-red-600 text-white py-1.5 px-4 rounded text-sm transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect wallet'}
        </button>
      )}
    </div>
  )
}
