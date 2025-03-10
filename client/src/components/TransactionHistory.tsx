'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { SONIC_TOKEN_ADDRESS } from '../lib/config';
import {
	useSonicTokenContract,
	formatTokenAmount,
} from '../lib/utils/contract';
import { sonicBlazeChain } from '../lib/config';

type Transaction = {
	hash: string;
	blockNumber: number;
	timestamp: number;
	from: string;
	to: string;
	value: string;
	event: 'transfer' | 'mint';
};

export default function TransactionHistory() {
	const { address } = useAccount();
	const { getSonicTokenContract } = useSonicTokenContract();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [decimals, setDecimals] = useState(18);

	// Flag to track active requests
	const [isLoadingInProgress, setIsLoadingInProgress] = useState(false);
	// Flag to track if transactions were ever loaded
	const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

	// Memoize the transaction history loading function
	const fetchTransactionHistory = useCallback(async () => {
		if (!address) return;

		// Check to avoid duplicate requests
		if (isLoadingInProgress) return;

		// Set flag that loading is in progress
		setIsLoadingInProgress(true);
		// Show loading only on first attempt
		if (!hasAttemptedLoad) {
			setLoading(true);
		}
		setError(null);

		try {
			const { contract, provider } = await getSonicTokenContract();

			// Get token decimals
			const tokenDecimals = await contract.decimals();
			setDecimals(tokenDecimals);

			// In ethers.js v6, event handling methods have changed
			// To prevent timeout errors, we only request the last 1000 blocks
			const currentBlock = await provider.getBlockNumber();
			// Use a limited range of the last 1000 blocks
			const fromBlock = Math.max(0, currentBlock - 1000);

			// Define the Transfer event filter with signature 'Transfer(address,address,uint256)'
			// Get events directly without using filters
			const transferEventSignature = 'Transfer(address,address,uint256)';
			const transferEventHash = ethers.id(transferEventSignature);

			// Get events for a specific contract in a limited block range
			console.log(
				`Requesting events from block ${fromBlock} to ${currentBlock}`
			);

			// Use the current contract address
			const logs = await provider.getLogs({
				address: SONIC_TOKEN_ADDRESS,
				topics: [transferEventHash],
				fromBlock: fromBlock,
				toBlock: currentBlock,
			});

			console.log(`Found ${logs.length} Transfer events`);

			// Format transactions
			const txPromises = logs.map(async (log) => {
				const block = await provider.getBlock(log.blockNumber);

				// Decode event data
				// In Transfer(address,address,uint256) the first topic (index 0) is the event signature hash
				// The second topic (index 1) is the from address (first indexed parameter)
				// The third topic (index 2) is the to address (second indexed parameter)
				// data contains non-indexed parameters (value)

				// Extract addresses from topics, removing the first 12 bytes
				const from =
					log.topics?.[1]
						? `0x${log.topics[1].slice(26)}`
						: '0x0000000000000000000000000000000000000000';

				const to =
					log.topics?.[2]
						? `0x${log.topics[2].slice(26)}`
						: '0x0000000000000000000000000000000000000000';

				// Try to decode the value from data
				let value = BigInt(0);
				if (log.data && log.data !== '0x') {
					value = BigInt(log.data);
				}

				// Check if this is a minting event (from = 0x0)
				const isTransfer =
					from !== '0x0000000000000000000000000000000000000000';

				return {
					hash: log.transactionHash,
					blockNumber: log.blockNumber,
					timestamp: block?.timestamp || 0,
					from,
					to,
					value: formatTokenAmount(value, tokenDecimals),
					event: isTransfer ? ('transfer' as const) : ('mint' as const),
				};
			});

			const formattedTxs = await Promise.all(txPromises);

			// Sort by timestamp (newest first)
			formattedTxs.sort((a, b) => b.timestamp - a.timestamp);

			console.log(`Formatted ${formattedTxs.length} transactions`);

			// Save sorted transactions
			setTransactions(formattedTxs);
			// Mark that a load attempt was made
			setHasAttemptedLoad(true);
		} catch (err) {
			console.error('Error retrieving transaction history:', err);
			setError(
				'Failed to load transaction history. Please try refreshing the page.'
			);
		} finally {
			setLoading(false);
			setIsLoadingInProgress(false);
		}
	}, [address, getSonicTokenContract, hasAttemptedLoad, isLoadingInProgress]);

	// Use useEffect only for initial loading and when address changes
	useEffect(() => {
		let mounted = true;

		// Load data only if component is mounted and address exists
		if (address && mounted) {
			// Delay loading slightly to avoid issues with parallel requests
			const timer = setTimeout(() => {
				if (mounted) {
					fetchTransactionHistory();
				}
			}, 500);

			return () => {
				mounted = false;
				clearTimeout(timer);
			};
		}

		return () => {
			mounted = false;
		};
	}, [address, fetchTransactionHistory]);

	// Removed auto-refresh to avoid component shifting

	const formatAddress = (addr: string) => {
		return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
	};

	const getExplorerTxUrl = (txHash: string) => {
		const explorer = sonicBlazeChain.blockExplorers?.default?.url;
		return explorer ? `${explorer}/tx/${txHash}` : '#';
	};

	const getExplorerAddressUrl = (addr: string) => {
		const explorer = sonicBlazeChain.blockExplorers?.default?.url;
		return explorer ? `${explorer}/address/${addr}` : '#';
	};

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp * 1000);
		return date.toLocaleString('en-US');
	};

	if (loading && !hasAttemptedLoad) {
		return (
			<div className="flex justify-center items-center py-10 font-montserrat">
				Loading transaction history...
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 font-montserrat">
				<h3 className="text-lg font-semibold mb-2">Error</h3>
				<p>{error}</p>
			</div>
		);
	}

	// Show the main interface even if there are no transactions
	// but with an appropriate message inside

	return (
		<div className="font-montserrat">
			<h2 className="text-2xl font-semibold mb-6">Transaction History</h2>

			{/* Loading indicator will only be shown during initial loading */}

			{transactions.length === 0 && hasAttemptedLoad ? (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4 font-montserrat">
					<p>No transactions found for the recent period.</p>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Type
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Transaction Hash
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Time
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									From
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									To
								</th>
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Amount
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{transactions.map((tx) => (
								<tr key={tx.hash} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												tx.event === 'mint'
													? 'bg-green-100 text-green-800'
													: 'bg-blue-100 text-blue-800'
											}`}
										>
											{tx.event === 'mint' ? 'Mint' : 'Transfer'}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<a
											href={getExplorerTxUrl(tx.hash)}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline"
										>
											{formatAddress(tx.hash)}
										</a>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatTimestamp(tx.timestamp)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<a
											href={getExplorerAddressUrl(tx.from)}
											target="_blank"
											rel="noopener noreferrer"
											className={`hover:underline ${
												address &&
												tx.from.toLowerCase() === address.toLowerCase()
													? 'font-medium text-green-600'
													: 'text-gray-900'
											}`}
										>
											{formatAddress(tx.from)}
										</a>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<a
											href={getExplorerAddressUrl(tx.to)}
											target="_blank"
											rel="noopener noreferrer"
											className={`hover:underline ${
												address && tx.to.toLowerCase() === address.toLowerCase()
													? 'font-medium text-green-600'
													: 'text-gray-900'
											}`}
										>
											{formatAddress(tx.to)}
										</a>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										{tx.value}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
