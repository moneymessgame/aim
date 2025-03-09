import type { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import dotenv from "dotenv"
dotenv.config()

const PRIVATE_KEY = process.env.PRIVATE_KEY
const EXPLORER_API_KEY = process.env.EXPLORER_API_KEY || ""

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        sonic: {
            url: process.env.SONIC_RPC_URL || "https://rpc.soniclabs.com",
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: 146,
        },
        sonic_testnet: {
            url: process.env.SONIC_TESTNET_RPC_URL || "https://rpc.blaze.soniclabs.com",
            accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
            chainId: 57054,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
            {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        ]
    },
    // etherscan: {
    //     apiKey: {
    //         sonic: EXPLORER_API_KEY,
    //         sonic_testnet: EXPLORER_API_KEY
    //     },
    //     customChains: [
    //         {
    //             network: "sonic",
    //             chainId: 146,
    //             urls: {
    //                 apiURL: "https://testnet.soniclabs.com/api",
    //                 browserURL: "https://testnet.soniclabs.com"
    //             }
    //         },
    //         {
    //             network: "sonic_testnet",
    //             chainId: 57054,
    //             urls: {
    //                 apiURL: "https://testnet.soniclabs.com/api",
    //                 browserURL: "https://testnet.soniclabs.com"
    //             }
    //         }
    //     ]
    // },
    // sourcify: {
    //     enabled: false
    // }
}

export default config