import { ethers } from 'ethers'
import { SONIC_TOKEN_ADDRESS } from '../config'

// ABI для контракта SonicToken, включая все основные функции
export const SONIC_TOKEN_ABI = [
  // Просмотр информации
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
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
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Транзакции
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Минтинг (только для владельца)
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Управление владельцем
  {
    inputs: [{ name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// Хук для работы с контрактом SonicToken через MetaMask
export function useSonicTokenContract() {
  const getSonicTokenContract = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask не обнаружен')
    }

    try {
      // Запрашиваем доступ к аккаунтам MetaMask
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // Создаем провайдер и контракт
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        SONIC_TOKEN_ADDRESS,
        SONIC_TOKEN_ABI,
        signer
      )
      
      return { contract, provider, signer }
    } catch (error) {
      console.error('Ошибка при подключении к контракту:', error)
      throw error
    }
  }

  return { getSonicTokenContract }
}

// Функции для форматирования и работы с значениями токенов
export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
  // Используем встроенную функцию ethers для форматирования
  try {
    return ethers.formatUnits(amount, decimals)
  } catch (error) {
    console.error('Ошибка при форматировании суммы токенов:', error)
    return '0'
  }
}

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  try {
    return ethers.parseUnits(amount, decimals)
  } catch (error) {
    console.error('Ошибка при парсинге суммы токенов:', error)
    return BigInt(0)
  }
}
