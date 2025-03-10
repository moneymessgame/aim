'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import {
	SONIC_TOKEN_ABI,
	useSonicTokenContract,
	formatTokenAmount,
} from '../lib/utils/contract';
import { SONIC_TOKEN_ADDRESS } from '../lib/config';

export default function ContractInfo() {
	const { address } = useAccount();
	const { getSonicTokenContract } = useSonicTokenContract();

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [contractInfo, setContractInfo] = useState<{
		name: string;
		symbol: string;
		decimals: number;
		totalSupply: string;
		ownerAddress: string;
		isOwner: boolean;
		userBalance: string;
	} | null>(null);

	// Memoize the data request function to prevent recreation on each render
	const fetchContractInfo = useCallback(async () => {
		if (!address) return;

		// Check if data is already loaded, don't update loading state
		if (!loading && contractInfo !== null && !error) return;

		setLoading(true);
		setError(null);

		try {
			const { contract } = await getSonicTokenContract();

			const [name, symbol, decimals, totalSupply, ownerAddress, userBalance] =
				await Promise.all([
					contract.name(),
					contract.symbol(),
					contract.decimals(),
					contract.totalSupply(),
					contract.owner(),
					contract.balanceOf(address),
				]);

			// Check that the component is still mounted (not unmounted)
			setContractInfo({
				name,
				symbol,
				decimals,
				totalSupply: formatTokenAmount(totalSupply, decimals),
				ownerAddress,
				isOwner: ownerAddress.toLowerCase() === address.toLowerCase(),
				userBalance: formatTokenAmount(userBalance, decimals),
			});
		} catch (err) {
			console.error('Error getting contract information:', err);
			setError(
				'Failed to load contract information. Please try refreshing the page.'
			);
		} finally {
			setLoading(false);
		}
	}, [address, contractInfo, error, getSonicTokenContract, loading]);

	// Use useEffect with minimal dependencies
	useEffect(() => {
		// Request data only when component mounts or address changes
		if (address) {
			fetchContractInfo();
		}

		// Add interval for periodic balance updates (30 seconds)
		const intervalId = setInterval(() => {
			if (address) {
				// Update only the balance, not all contract information
				updateUserBalance();
			}
		}, 30000);

		return () => clearInterval(intervalId);
	}, [address, fetchContractInfo]);

	// Function to update only the user's balance
	const updateUserBalance = useCallback(async () => {
		if (!address || !contractInfo) return;

		try {
			const { contract } = await getSonicTokenContract();
			const userBalance = await contract.balanceOf(address);

			// Update only the balance, not touching other properties
			setContractInfo((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					userBalance: formatTokenAmount(userBalance, prev.decimals),
				};
			});
		} catch (err) {
			console.error('Error updating balance:', err);
		}
	}, [address, contractInfo, getSonicTokenContract]);

	if (loading) {
		return (
			<div className="flex justify-center items-center py-10 font-montserrat">
				Loading contract information...
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

	if (!contractInfo) {
		return (
			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 font-montserrat">
				<p>Contract information is not available.</p>
			</div>
		);
	}

	return (
		<div className="font-montserrat">
			<h2 className="text-2xl font-semibold mb-6">Token Information</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Contract Address
						</h3>
						<p className="mt-1 break-all">{SONIC_TOKEN_ADDRESS}</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Token Name
						</h3>
						<p className="mt-1">{contractInfo.name}</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">Symbol</h3>
						<p className="mt-1">{contractInfo.symbol}</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Decimals
						</h3>
						<p className="mt-1">{contractInfo.decimals}</p>
					</div>
				</div>

				<div className="space-y-4">
					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Total Supply
						</h3>
						<p className="mt-1">
							{contractInfo.totalSupply} {contractInfo.symbol}
						</p>
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">
							Contract Owner
						</h3>
						<p className="mt-1 break-all">{contractInfo.ownerAddress}</p>
						{contractInfo.isOwner && (
							<span className="inline-block mt-1 text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
								You are the contract owner
							</span>
						)}
					</div>

					<div>
						<h3 className="text-sm font-medium text-gray-500">Your Balance</h3>
						<p className="mt-1">
							{contractInfo.userBalance} {contractInfo.symbol}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
