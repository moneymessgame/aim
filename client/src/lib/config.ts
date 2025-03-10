import { Chain } from 'wagmi'

export const sonicBlazeChain: Chain = {
  id: 57054,
  name: 'Sonic Blaze Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Sonic',
    symbol: 'S',
  },
  rpcUrls: {
    default: { http: ['https://rpc.blaze.soniclabs.com'] },
  },
  blockExplorers: {
    default: { name: 'Sonic Blaze Explorer', url: 'https://testnet.soniclabs.com' },
  },
  testnet: true,
}

export const SONIC_TOKEN_ADDRESS = '0x6d4fe915d6a2523F295e73007D8c0538434080db'
